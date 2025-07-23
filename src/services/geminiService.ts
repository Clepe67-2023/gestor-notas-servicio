
import { GoogleGenAI } from "@google/genai";

// Accede a la clave de API desde las variables de entorno de Vite.
// ¡Importante! La variable en tu archivo .env o en Vercel debe llamarse VITE_API_KEY.
const API_KEY = import.meta.env.VITE_API_KEY;

let ai: GoogleGenAI | null = null;
let initError = '';

if (!API_KEY) {
  initError = "La variable de entorno VITE_API_KEY no está configurada. Las funciones de IA están deshabilitadas.";
  console.warn(initError);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    initError = "Error al inicializar la API de Gemini. Verifique la clave de API.";
    console.error(initError, error);
    ai = null;
  }
}

export const generateServiceDescription = async (keywords: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve(initError || "El cliente de IA no está disponible. Verifique la configuración de la API_KEY.");
  }
  
  if (!keywords.trim()) {
    return Promise.resolve("");
  }

  try {
    const prompt = `Basado en las siguientes palabras clave, redacta una descripción profesional y concisa para una nota de servicio. Las palabras clave son: "${keywords}". La descripción debe ser clara, detallada y estar en español.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.5,
            topP: 1,
            topK: 32,
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Hubo un error al generar la descripción. Por favor, inténtelo de nuevo o escríbala manualmente.";
  }
};