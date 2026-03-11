import express from "express";
import cors from "cors";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { AppConfig } from "./types";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check for Vercel
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Google Sheets Setup Helpers
const cleanEnvVar = (val: string | undefined) => {
  if (!val) return val;
  let cleaned = val.trim();
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

const GOOGLE_SHEET_ID = extractSheetId(process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
const GOOGLE_SERVICE_ACCOUNT_EMAIL = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL);

const rawKey = process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
let GOOGLE_PRIVATE_KEY = cleanEnvVar(rawKey);
if (GOOGLE_PRIVATE_KEY) {
  GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY.replace(/\\"/g, '"');
}

const setupGoogleSheet = async () => {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn("⚠️ Google Sheets credentials missing");
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
    console.error("❌ Error connecting to Google Sheets:", error.message || error);
    // Store the last error for the debug endpoint
    (global as any).lastSheetError = error.message || String(error);
    return null;
  }
};

// --- API ROUTES ---

app.get("/api/debug-sheets", async (_req, res) => {
  try {
    const status = {
      sheetId: (GOOGLE_SHEET_ID && GOOGLE_SHEET_ID.length > 10) 
        ? `${GOOGLE_SHEET_ID.substring(0, 5)}...${GOOGLE_SHEET_ID.substring(GOOGLE_SHEET_ID.length - 5)}` 
        : (GOOGLE_SHEET_ID || "MISSING"),
      email: (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_SERVICE_ACCOUNT_EMAIL.length > 5)
        ? `${GOOGLE_SERVICE_ACCOUNT_EMAIL.substring(0, 5)}...` 
        : (GOOGLE_SERVICE_ACCOUNT_EMAIL || "MISSING"),
      privateKeyLength: GOOGLE_PRIVATE_KEY?.length || 0,
      hasBeginHeader: GOOGLE_PRIVATE_KEY?.includes("-----BEGIN PRIVATE KEY-----") || false,
      hasEndHeader: GOOGLE_PRIVATE_KEY?.includes("-----END PRIVATE KEY-----") || false,
      hasNewLines: GOOGLE_PRIVATE_KEY?.includes("\n") || false,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    };
    
    const doc = await setupGoogleSheet();
    res.json({
      envStatus: status,
      connectionSuccess: !!doc,
      sheetTitle: doc?.title || "N/A",
      error: !doc ? ((global as any).lastSheetError || "Check server logs for detailed error") : null,
      tip: !doc ? "Ensure GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set in Vercel Environment Variables." : null
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sync-order", async (req, res) => {
  const order = req.body;
  const doc = await setupGoogleSheet();
  if (!doc) return res.status(503).json({ success: false, message: "Google Sheets not configured" });

  try {
    const sheet = doc.sheetsByIndex[0];
    const headers = ['ID', 'Fecha', 'Cliente', 'Detalles', 'Total', 'Estado'];
    try {
      await sheet.loadHeaderRow();
    } catch (_e) {
      await sheet.setHeaderRow(headers);
    }
    await sheet.addRow({
      ID: order.id,
      Fecha: order.date,
      Cliente: order.customerName,
      Detalles: order.details,
      Total: order.total,
      Estado: order.status
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/update-order-status", async (req, res) => {
  const { orderId, status } = req.body;
  const doc = await setupGoogleSheet();
  if (!doc) return res.status(503).json({ success: false, message: "Google Sheets not configured" });

  try {
    let sheet = doc.sheetsByTitle["Orders"] || doc.sheetsByTitle["Pedidos"] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("ID") === orderId || r.get("id") === orderId);
    
    if (row) {
      const statusHeader = ["Estado", "Status", "estado", "status"].find(h => row.get(h) !== undefined);
      if (statusHeader) {
        row.set(statusHeader, status);
        await row.save();
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, message: "Status column not found" });
      }
    } else {
      res.status(404).json({ success: false, message: "Order not found in sheet" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/export-to-sheets", async (req, res) => {
  const config = req.body as AppConfig;
  const doc = await setupGoogleSheet();
  if (!doc) return res.status(503).json({ success: false, message: "Google Sheets not configured" });

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
    const { sizes: _s, flavors: _f, fillings: _fi, decorations: _d, topperPrices: _t, colors: _c, ...rest } = config;
    flattenConfig(rest);
    await configSheet.addRows(configRows);

    if (config.sizes) {
      const sheet = await ensureSheet("Sizes", ["id", "diameter", "heightType", "portions", "basePrice", "costMultiplier"]);
      await sheet.addRows(config.sizes);
    }
    if (config.flavors) {
      const sheet = await ensureSheet("Flavors", ["id", "name", "color", "priceModifier", "pattern", "textureUrl"]);
      await sheet.addRows(config.flavors);
    }
    if (config.fillings) {
      const sheet = await ensureSheet("Fillings", ["id", "name", "color", "priceModifier", "pattern", "textureUrl"]);
      await sheet.addRows(config.fillings);
    }
    if (config.decorations) {
      const sheet = await ensureSheet("Decorations", ["id", "label", "priceModifier", "textureUrl"]);
      await sheet.addRows(Object.values(config.decorations) as any[]);
    }
    if (config.topperPrices) {
      const sheet = await ensureSheet("Toppers", ["type", "price"]);
      await sheet.addRows(Object.entries(config.topperPrices).map(([type, price]) => ({ type, price })));
    }
    if (config.colors) {
      const sheet = await ensureSheet("Colors", ["name", "hex", "isSaturated", "priceModifier"]);
      await sheet.addRows(config.colors);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/sync-all-orders-to-sheets", async (req, res) => {
  const orders = req.body;
  const doc = await setupGoogleSheet();
  if (!doc) return res.status(503).json({ success: false, message: "Google Sheets not configured" });

  try {
    let sheet = doc.sheetsByTitle["Orders"];
    if (!sheet) {
      sheet = await doc.addSheet({ title: "Orders", headerValues: ["ID", "Date", "Customer", "Details", "Total", "Status"] });
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
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/config", async (_req, res) => {
  const doc = await setupGoogleSheet();
  if (!doc) return res.status(503).json({ success: false, message: "Google Sheets not configured" });

  try {
    const configData: any = {};
    const sheets = doc.sheetsByIndex;
    const getSheet = (names: string[]) => sheets.find(s => names.some(n => s.title.toLowerCase() === n.toLowerCase()));
    const findHeader = (sheetHeaders: string[], possibleNames: string[]) => {
      return sheetHeaders.find(h => possibleNames.some(p => h.trim().toLowerCase() === p.trim().toLowerCase()));
    };

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
          if (key && value !== undefined) {
            const keys = String(key).split('.');
            let current = configData;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }
            let val: any = String(value);
            if (val.toLowerCase() === 'true') val = true;
            else if (val.toLowerCase() === 'false') val = false;
            else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
            current[keys[keys.length - 1]] = val;
          }
        });
      }
    }

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

    const sizes = await processListSheet(["Sizes", "Dimensiones", "Tamaños", "Moldes"], {
      id: ["id", "ID", "Id", "id_molde"],
      diameter: ["diameter", "DIAMETER", "Diámetro", "Diametro", "diámetro"],
      heightType: ["heightType", "height_type", "Tipo Altura", "Altura", "altura"],
      portions: ["portions", "Portions", "Porciones", "porciones"],
      basePrice: ["basePrice", "base_price", "Precio Base", "Precio", "precio"],
      costMultiplier: ["costMultiplier", "cost_multiplier", "Multiplicador", "multiplicador"]
    });
    if (sizes) configData.sizes = sizes;

    const flavors = await processListSheet(["Flavors", "Sabores", "Bizcochos"], {
      id: ["id", "ID", "Id"],
      name: ["name", "Name", "Nombre", "nombre"],
      color: ["color", "Color", "Color Hex"],
      priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
      pattern: ["pattern", "Pattern", "Patrón", "Diseño"],
      textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
    });
    if (flavors) configData.flavors = flavors;

    const fillings = await processListSheet(["Fillings", "Rellenos"], {
      id: ["id", "ID", "Id"],
      name: ["name", "Name", "Nombre", "nombre"],
      color: ["color", "Color", "Color Hex"],
      priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
      pattern: ["pattern", "Pattern", "Patrón", "Diseño"],
      textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
    });
    if (fillings) configData.fillings = fillings;

    const decorationsList = await processListSheet(["Decorations", "Decoraciones", "Estilos"], {
      id: ["id", "ID", "Id"],
      label: ["label", "Label", "Nombre", "Etiqueta"],
      priceModifier: ["priceModifier", "price_modifier", "Precio Extra", "Extra"],
      textureUrl: ["textureUrl", "texture_url", "Imagen", "URL Imagen"]
    });
    if (decorationsList) {
      const decorations: any = {};
      decorationsList.forEach((d: any) => { if (d.id) decorations[d.id] = d; });
      configData.decorations = decorations;
    }

    const toppersList = await processListSheet(["Toppers", "Adornos"], {
      type: ["type", "Type", "Tipo", "Categoría"],
      price: ["price", "Price", "Precio", "Costo"]
    });
    if (toppersList) {
      const topperPrices: any = {};
      toppersList.forEach((t: any) => { if (t.type) topperPrices[t.type] = Number(t.price); });
      configData.topperPrices = topperPrices;
    }

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
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- SERVER STARTUP ---

const startServer = async () => {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    } catch (e) {
      console.error("Vite failed to load:", e);
    }
  } else if (!process.env.VERCEL) {
    // Production but not Vercel
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
};

startServer();

export default app;
