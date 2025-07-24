import { GoogleGenAI } from "@google/genai";

// Accede a la clave de API desde las variables de entorno.
// Esto es configurado en vite.config.ts para funcionar en el navegador.
// En Vercel, debe crear una variable de entorno llamada API_KEY.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let initError = '';

if (!API_KEY) {
  initError = "Error de Configuración: La variable de entorno API_KEY no está definida. Por favor, añada la variable 'API_KEY' en la configuración de su proyecto en Vercel para usar las funciones de IA.";
  console.warn(initError);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    initError = "Error al inicializar la API de Gemini. Verifique que su API_KEY sea correcta.";
    console.error(initError, error);
    ai = null;
  }
}

export interface GenerationResult {
    success: boolean;
    data: string;
}

export const generateServiceDescription = async (keywords: string): Promise<GenerationResult> => {
  if (!ai) {
    return { success: false, data: initError || "El cliente de IA no está disponible. Verifique la configuración de la API_KEY." };
  }
  
  if (!keywords.trim()) {
    return { success: true, data: "" };
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

    return { success: true, data: (response.text ?? '').trim() };
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    let errorMessage = "Hubo un error al generar la descripción. Por favor, inténtelo de nuevo o escríbala manualmente.";
     if (error instanceof Error && error.message.includes('API key not valid')) {
        errorMessage = "Error: La clave de API proporcionada no es válida. Por favor, verifíquela en la configuración de su proyecto en Vercel.";
    }
    return { success: false, data: errorMessage };
  }
};