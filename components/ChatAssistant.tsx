
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AppConfig, AppState } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  buttons?: string[];
}

interface ChatAssistantProps {
  config: AppConfig;
  onNavigateToSummary: () => void;
  onUpdateState: (updates: Partial<AppState>) => void;
  isEnabled?: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ config, onNavigateToSummary, onUpdateState, isEnabled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: `¡Hola! Soy MathiBot, tu asistente de MathiCake Studio. 🎂 Para empezar a asesorarte mejor, ¿podrías enviarme una foto de referencia del pastel que tienes en mente?`,
      buttons: ["No tengo foto, ayúdame", "Ver sabores", "Ver tamaños"]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isEnabled) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if (!userMessage && !selectedImage) return;
    if (isLoading) return;

    const currentImage = imagePreview;
    const currentFile = selectedImage;

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMessage,
      image: currentImage || undefined
    }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `
        Eres MathiBot, el asistente virtual experto de MathiCake Studio. Tu objetivo es asesorar a los clientes para que realicen la mejor compra posible.
        
        Información detallada del catálogo (USA LOS IDs PARA ACTUALIZAR EL ESTADO):
        - Sabores de bizcocho: ${config.flavors.map(f => `${f.name} (ID: ${f.id})`).join(', ')}
        - Rellenos disponibles: ${config.fillings.map(f => `${f.name} (ID: ${f.id})`).join(', ')}
        - Tamaños y Porciones:
          ${config.sizes.map(s => `- ${s.diameter}cm (${s.heightType === 'TALL' ? 'Alto' : 'Bajo'}): ${s.portions} - Precio base: $${s.basePrice} (ID: ${s.id})`).join('\n          ')}
        - Productos Especiales: ${config.specialProducts?.map(p => `${p.title} ($${p.price}) (ID: ${p.id})`).join(', ') || 'No hay productos especiales'}
        - Estilos de decoración: ${Object.entries(config.decorations).map(([id, d]) => `${d.label} (ID: ${id}, Costo: $${d.priceModifier})`).join(', ')}
        - Coberturas disponibles: Chantilly, Chocolate, Arequipe.
        - Colores: ${config.colors.map(c => `${c.name} (HEX: ${c.hex})`).join(', ')}
        
        Políticas del Studio:
        - NO TRABAJAMOS CON FONDANT. Es una restricción estricta. Si el cliente pide fondant o envía una imagen de un pastel de fondant, explica amablemente que solo trabajamos con nuestras coberturas (Chantilly, Chocolate, Arequipe) y ofrece adaptarlo.
        - Los precios base no incluyen decoraciones complejas, toppers o esferas.
        - Los colores saturados (Rojo, Azul Rey, Negro) tienen un recargo de $${config.saturatedColorSurcharge}.
        - Toppers personalizados: $${config.topperPrices.personalized}.
        - Esferas decorativas: $${config.spheresPrice} el set.
        
        Reglas de interacción:
        1. Sé extremadamente amable, servicial y con un toque dulce.
        2. SINTETIZA: No des respuestas demasiado largas. Ve al grano pero con calidez.
        3. Haz SOLO UNA PREGUNTA a la vez.
        4. Es OBLIGATORIO preguntar y recopilar:
           - ¿El pastel es TEMÁTICO? (Si es así, pide detalles del tema).
           - ¿Desea añadir TOPPERS personalizados o esferas decorativas?
           - ¿Desea añadir algún PRODUCTO ESPECIAL (galletas, cupcakes, etc.)?
           - Nombre del cumpleañero/cliente (birthdayName)
           - Edad (birthdayAge)
           - Fecha de entrega (deliveryDate)
           - Hora de entrega (deliveryTime)
        5. Si el cliente envía una imagen, analízala y relaciónala con nuestro catálogo.
        6. Siempre proporciona entre 2 y 4 opciones de respuesta rápida (botones).
        7. Cuando tengas TODA la información (tamaño, sabor, relleno, decoración, nombre, edad, fecha, hora, tema, extras), ofrece un botón que diga "Ir a pagar". No repitas toda la información en este paso, solo confirma brevemente que todo está listo para procesar el pedido.
        8. SOLO establece shouldRedirectToSummary en true cuando el usuario explícitamente elija "Ir a pagar" o confirme que quiere finalizar. En este caso, la respuesta de texto debe ser MUY corta (ej: "¡Perfecto! Te redirijo ahora mismo.").
        9. IMPORTANTE: Si el cliente hace una elección clara, incluye los IDs correspondientes en stateUpdates.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "La respuesta de texto para el usuario." },
          suggestedButtons: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Una lista de 2 a 4 frases cortas para que el usuario responda haciendo clic."
          },
          shouldRedirectToSummary: { 
            type: Type.BOOLEAN, 
            description: "Establecer en true SOLO cuando el usuario elija 'Ir a pagar' o confirme finalizar el pedido." 
          },
          stateUpdates: {
            type: Type.OBJECT,
            description: "Actualizaciones parciales para el estado de la aplicación basadas en la conversación.",
            properties: {
              selectedSizeId: { type: Type.STRING },
              selectedFlavorId: { type: Type.STRING },
              selectedFillingId: { type: Type.STRING },
              selectedDecoration: { type: Type.STRING },
              theme: { type: Type.STRING },
              birthdayName: { type: Type.STRING },
              birthdayAge: { type: Type.STRING },
              deliveryDate: { type: Type.STRING },
              deliveryTime: { type: Type.STRING }
            }
          }
        },
        required: ["text", "suggestedButtons", "shouldRedirectToSummary"]
      };

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      let messagePayload: any;
      
      if (currentFile) {
        const base64Data = await fileToBase64(currentFile);
        messagePayload = {
          message: {
            parts: [
              { text: userMessage || "Analiza esta imagen para mi pastel" },
              {
                inlineData: {
                  mimeType: currentFile.type,
                  data: base64Data
                }
              }
            ]
          }
        };
      } else {
        messagePayload = { message: userMessage };
      }

      const result = await chat.sendMessage(messagePayload);
      const responseText = result.text;
      if (!responseText) {
        throw new Error("No response text from AI");
      }
      const responseData = JSON.parse(responseText);

      // Procesar actualizaciones de estado
      if (responseData.stateUpdates) {
        const updates: any = {};
        if (responseData.stateUpdates.selectedSizeId) {
          const size = config.sizes.find(s => s.id === responseData.stateUpdates.selectedSizeId);
          if (size) updates.selectedSize = size;
        }
        if (responseData.stateUpdates.selectedFlavorId) {
          const flavor = config.flavors.find(f => f.id === responseData.stateUpdates.selectedFlavorId);
          if (flavor) updates.selectedFlavor = flavor;
        }
        if (responseData.stateUpdates.selectedFillingId) {
          const filling = config.fillings.find(f => f.id === responseData.stateUpdates.selectedFillingId);
          if (filling) updates.selectedFilling = filling;
        }
        if (responseData.stateUpdates.selectedDecoration) {
          updates.selectedDecoration = responseData.stateUpdates.selectedDecoration;
        }
        if (responseData.stateUpdates.theme) updates.theme = responseData.stateUpdates.theme;
        if (responseData.stateUpdates.birthdayName) updates.birthdayName = responseData.stateUpdates.birthdayName;
        if (responseData.stateUpdates.birthdayAge) updates.birthdayAge = responseData.stateUpdates.birthdayAge;
        if (responseData.stateUpdates.deliveryDate) updates.deliveryDate = responseData.stateUpdates.deliveryDate;
        if (responseData.stateUpdates.deliveryTime) updates.deliveryTime = responseData.stateUpdates.deliveryTime;

        if (Object.keys(updates).length > 0) {
          onUpdateState(updates);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseData.text || "Lo siento, tuve un pequeño problema técnico. ¿Podrías repetir eso?",
        buttons: responseData.suggestedButtons
      }]);

      if (responseData.shouldRedirectToSummary) {
        setTimeout(() => {
          onNavigateToSummary();
          setIsOpen(false);
        }, 400);
      }
    } catch (error) {
      console.error("Error en el chat:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-[200]">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            className="absolute bottom-20 right-0 w-[380px] max-w-[90vw] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-xs tracking-widest">MathiBot</h3>
                  <p className="text-[10px] font-bold opacity-80">Asistente IA</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none'}`}>
                      {m.image && (
                        <img 
                          src={m.image} 
                          alt="Referencia" 
                          className="w-full max-w-[200px] rounded-lg mb-2 border border-white/20"
                        />
                      )}
                      {m.text}
                    </div>
                  </div>
                  
                  {m.role === 'model' && m.buttons && m.buttons.length > 0 && i === messages.length - 1 && !isLoading && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-10">
                      {m.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(btn)}
                          className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-slate-50 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-primary" />
                  <button 
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all"
                  title="Adjuntar foto de referencia"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu duda aquí..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-slate-800 text-white' : 'bg-primary text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-16 bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap pointer-events-none"
          >
            <p className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              ¿Necesitas ayuda?
            </p>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default ChatAssistant;
