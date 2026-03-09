import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { AppConfig } from "./types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Google Sheets Setup
  const cleanEnvVar = (val: string | undefined) => {
    if (!val) return val;
    let cleaned = val.trim();
    // Remove surrounding quotes if they exist
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    return cleaned;
  };

  const extractSheetId = (val: string | undefined) => {
    if (!val) return val;
    const cleaned = cleanEnvVar(val);
    if (!cleaned) return cleaned;
    const match = cleaned.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : cleaned;
  };

  const GOOGLE_SHEET_ID = extractSheetId(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = cleanEnvVar(process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
  const GOOGLE_PRIVATE_KEY = cleanEnvVar(process.env.GOOGLE_SHEETS_PRIVATE_KEY)?.replace(/\\n/g, "\n");

  const setupGoogleSheet = async () => {
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.warn("⚠️ Google Sheets credentials missing. Orders will not be synced to Sheets.");
      return null;
    }

    try {
      const serviceAccountAuth = new JWT({
        email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      return doc;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.error("❌ Error: El ID de la hoja de Google no es válido o la hoja no existe.");
      } else if (error.response?.status === 403) {
        console.error("❌ Error: Permiso denegado. Asegúrate de haber compartido la hoja con el correo de la cuenta de servicio.");
      } else {
        console.error("❌ Error conectando a Google Sheets:", error.message || error);
      }
      return null;
    }
  };

  // API Routes
  app.get("/api/debug-sheets", async (_req, res) => {
    const status = {
      sheetId: GOOGLE_SHEET_ID ? `${GOOGLE_SHEET_ID.substring(0, 5)}...${GOOGLE_SHEET_ID.substring(GOOGLE_SHEET_ID.length - 5)}` : "MISSING",
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL ? `${GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 5)}...` : "MISSING",
      privateKeyLength: GOOGLE_PRIVATE_KEY?.length || 0,
      privateKeyStart: GOOGLE_PRIVATE_KEY?.substring(0, 30),
    };
    
    try {
      const doc = await setupGoogleSheet();
      res.json({
        envStatus: status,
        connectionSuccess: !!doc,
        sheetTitle: doc?.title || "N/A",
        error: !doc ? "Check server logs for detailed error" : null
      });
    } catch (e: any) {
      res.json({
        envStatus: status,
        connectionSuccess: false,
        error: e.message
      });
    }
  });

  app.post("/api/update-order-status", async (req, res) => {
    const { orderId, status } = req.body;
    const doc = await setupGoogleSheet();
    if (!doc) return res.status(503).json({ success: false });

    try {
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      const row = rows.find(r => r.get("ID") === orderId);
      
      if (row) {
        row.set("Estado", status);
        await row.save();
        console.log(`✅ Order ${orderId} status updated to ${status} in Sheets`);
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Order not found in Sheets" });
      }
    } catch (error) {
      console.error("❌ Error updating order status in Sheets:", error);
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/export-to-sheets", async (req, res) => {
    const config = req.body as AppConfig;
    const doc = await setupGoogleSheet();
    if (!doc) return res.status(503).json({ success: false, message: "Sheets not configured" });

    try {
      const ensureSheet = async (title: string, headers: string[]) => {
        let sheet = doc.sheetsByTitle[title];
        if (sheet) {
          await sheet.clear();
          await sheet.setHeaderRow(headers);
        } else {
          sheet = await doc.addSheet({ title, headerValues: headers });
        }
        return sheet;
      };

      // 1. Config (Key-Value)
      const configSheet = await ensureSheet("Config", ["Key", "Value"]);
      const configRows: any[] = [];
      const flattenConfig = (obj: any, prefix = "") => {
        for (const key in obj) {
          const val = obj[key];
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            flattenConfig(val, fullKey);
          } else if (!Array.isArray(val)) {
            configRows.push({ Key: fullKey, Value: String(val) });
          }
        }
      };
      const { sizes: _sizes, flavors: _flavors, fillings: _fillings, decorations: _decorations, topperPrices: _topperPrices, colors: _colors, ...rest } = config;
      flattenConfig(rest);
      await configSheet.addRows(configRows);

      // 2. Sizes
      if (config.sizes) {
        const sheet = await ensureSheet("Sizes", ["id", "diameter", "heightType", "portions", "basePrice", "costMultiplier"]);
        await sheet.addRows(config.sizes);
      }

      // 3. Flavors
      if (config.flavors) {
        const sheet = await ensureSheet("Flavors", ["id", "name", "color", "priceModifier", "pattern", "textureUrl"]);
        await sheet.addRows(config.flavors);
      }

      // 4. Fillings
      if (config.fillings) {
        const sheet = await ensureSheet("Fillings", ["id", "name", "color", "priceModifier", "pattern", "textureUrl"]);
        await sheet.addRows(config.fillings);
      }

      // 5. Decorations
      if (config.decorations) {
        const sheet = await ensureSheet("Decorations", ["id", "label", "priceModifier", "textureUrl"]);
        const rows = Object.values(config.decorations);
        await sheet.addRows(rows as any[]);
      }

      // 6. Toppers
      if (config.topperPrices) {
        const sheet = await ensureSheet("Toppers", ["type", "price"]);
        const rows = Object.entries(config.topperPrices).map(([type, price]) => ({ type, price }));
        await sheet.addRows(rows);
      }

      // 7. Colors
      if (config.colors) {
        const sheet = await ensureSheet("Colors", ["name", "hex", "isSaturated", "priceModifier"]);
        await sheet.addRows(config.colors);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("❌ Error exporting config to Sheets:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/sync-all-orders-to-sheets", async (req, res) => {
    const orders = req.body;
    const doc = await setupGoogleSheet();
    if (!doc) return res.status(503).json({ success: false, message: "Sheets not configured" });

    try {
      let sheet = doc.sheetsByTitle["Orders"];
      if (!sheet) {
        sheet = await doc.addSheet({ 
          title: "Orders", 
          headerValues: ["ID", "Date", "Customer", "Details", "Total", "Status"] 
        });
      } else {
        await sheet.clear();
        await sheet.setHeaderRow(["ID", "Date", "Customer", "Details", "Total", "Status"]);
      }

      const rows = orders.map((order: any) => ({
        ID: order.id,
        Date: order.date,
        Customer: order.customerName,
        Details: order.details,
        Total: order.total,
        Status: order.status
      }));

      await sheet.addRows(rows);
      res.json({ success: true });
    } catch (error: any) {
      console.error("❌ Error syncing orders to Sheets:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/config", async (_req, res) => {
    const doc = await setupGoogleSheet();
    if (!doc) return res.status(503).json({ success: false, message: "Google Sheets no está configurado o las credenciales son incorrectas." });

    try {
      const configData: any = {};
      const sheets = doc.sheetsByIndex;
      const getSheet = (names: string[]) => sheets.find(s => names.some(n => s.title.toLowerCase() === n.toLowerCase()));

      const findHeader = (sheetHeaders: string[], possibleNames: string[]) => {
        return sheetHeaders.find(h => possibleNames.some(p => h.trim().toLowerCase() === p.trim().toLowerCase()));
      };

      // 1. Process "Config" sheet (Simple Key-Value)
      const configSheet = getSheet(["Config", "Configuración", "Ajustes"]);
      if (configSheet) {
        await configSheet.loadHeaderRow();
        const headers = configSheet.headerValues;
        const keyCol = findHeader(headers, ["Key", "Clave", "Propiedad", "key"]);
        const valCol = findHeader(headers, ["Value", "Valor", "value"]);

        if (keyCol && valCol) {
          const rows = await configSheet.getRows();
          rows.forEach(row => {
            const key = row.get(keyCol);
            const value = row.get(valCol);
            if (key && value !== undefined && value !== null) {
              const keys = String(key).split('.');
              let current = configData;
              for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
              }
              let parsedValue = String(value);
              if (parsedValue.toLowerCase() === 'true') parsedValue = 'true'; // Keep as string for now or parse
              
              // Smart parsing
              let finalVal: any = parsedValue;
              if (parsedValue.toLowerCase() === 'true') finalVal = true;
              else if (parsedValue.toLowerCase() === 'false') finalVal = false;
              else if (!isNaN(Number(parsedValue)) && parsedValue.trim() !== '') finalVal = Number(parsedValue);
              
              current[keys[keys.length - 1]] = finalVal;
            }
          });
        }
      }

      // Helper to process list-based sheets
      const processListSheet = async (sheetNames: string[], mapping: Record<string, string[]>) => {
        const sheet = getSheet(sheetNames);
        if (!sheet) return null;

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        const rows = await sheet.getRows();

        return rows.map(row => {
          const item: any = {};
          for (const [targetKey, possibleNames] of Object.entries(mapping)) {
            const actualHeader = findHeader(headers, possibleNames);
            if (actualHeader) {
              const val = row.get(actualHeader);
              if (val !== undefined && val !== null && val !== "") {
                // Auto-convert numbers
                if (!isNaN(Number(val)) && String(val).trim() !== '' && !targetKey.toLowerCase().includes('id') && !targetKey.toLowerCase().includes('name') && !targetKey.toLowerCase().includes('hex')) {
                  item[targetKey] = Number(val);
                } else {
                  item[targetKey] = val;
                }
              }
            }
          }
          return item;
        });
      };

      // 2. Sizes
      const sizes = await processListSheet(["Sizes", "Dimensiones", "Tamaños", "Moldes"], {
        id: ["id", "ID", "Id", "id_molde"],
        diameter: ["diameter", "DIAMETER", "Diámetro", "Diametro", "diámetro"],
        heightType: ["heightType", "height_type", "Tipo Altura", "Altura", "altura"],
        portions: ["portions", "Portions", "Porciones", "porciones"],
        basePrice: ["basePrice", "base_price", "Precio Base", "Precio", "precio"],
        costMultiplier: ["costMultiplier", "cost_multiplier", "Multiplicador", "multiplicador"]
      });
      if (sizes) configData.sizes = sizes;

      // 3. Flavors
      const flavors = await processListSheet(["Flavors", "Sabores", "Bizcochos"], {
        id: ["id", "ID", "Id"],
        name: ["name", "Name", "Nombre", "nombre"],
        color: ["color", "Color", "Color Hex"],
        priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
        pattern: ["pattern", "Pattern", "Patrón", "Diseño"],
        textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
      });
      if (flavors) configData.flavors = flavors;

      // 4. Fillings
      const fillings = await processListSheet(["Fillings", "Rellenos"], {
        id: ["id", "ID", "Id"],
        name: ["name", "Name", "Nombre", "nombre"],
        color: ["color", "Color", "Color Hex"],
        priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
        pattern: ["pattern", "Pattern", "Patrón", "Diseño"],
        textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
      });
      if (fillings) configData.fillings = fillings;

      // 5. Decorations
      const decorationsList = await processListSheet(["Decorations", "Decoraciones", "Estilos"], {
        id: ["id", "ID", "Id"],
        label: ["label", "Label", "Nombre", "Etiqueta"],
        priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
        textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
      });
      if (decorationsList) {
        const decorations: any = {};
        decorationsList.forEach((d: any) => {
          if (d.id) decorations[d.id] = d;
        });
        configData.decorations = decorations;
      }

      // 6. Toppers
      const toppersList = await processListSheet(["Toppers", "Adornos"], {
        type: ["type", "Type", "Tipo", "Categoría"],
        price: ["price", "Price", "Precio", "Costo"]
      });
      if (toppersList) {
        const topperPrices: any = {};
        toppersList.forEach((t: any) => {
          if (t.type) topperPrices[t.type] = Number(t.price);
        });
        configData.topperPrices = topperPrices;
      }

      // 7. Colors
      const colors = await processListSheet(["Colors", "Colores"], {
        name: ["name", "Name", "Nombre", "nombre"],
        hex: ["hex", "HEX", "Color", "Código"],
        isSaturated: ["isSaturated", "is_saturated", "Saturado", "saturado"],
        priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"]
      });
      if (colors) {
        configData.colors = colors.map((c: any) => ({
          ...c,
          isSaturated: String(c.isSaturated).toLowerCase() === 'true' || c.isSaturated === true
        }));
      }

      res.json(configData);
    } catch (error: any) {
      console.error("❌ Error reading config from Sheets:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/sync-order", async (req, res) => {
    const order = req.body;
    const doc = await setupGoogleSheet();

    if (!doc) {
      return res.status(503).json({ 
        success: false, 
        message: "Google Sheets integration not configured" 
      });
    }

    try {
      const sheet = doc.sheetsByIndex[0];
      
      // Define the headers we expect
      const headers = ['ID', 'Fecha', 'Cliente', 'Detalles', 'Total', 'Estado'];

      try {
        // Try to load existing headers
        await sheet.loadHeaderRow();
      } catch (_error) {
        // If loading headers fails (e.g., empty sheet), set them explicitly
        console.log("Sheet appears to be empty, setting headers...");
        await sheet.setHeaderRow(headers);
      }

      // Now that headers are guaranteed to be loaded, add the row
      await sheet.addRow({
        ID: order.id,
        Fecha: order.date,
        Cliente: order.customerName,
        Detalles: order.details,
        Total: order.total,
        Estado: order.status
      });

      console.log(`✅ Order ${order.id} synced to Google Sheets`);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error adding row to Google Sheets:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
