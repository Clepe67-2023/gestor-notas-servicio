
import { GoogleGenAI } from "@google/genai";

// Accede a la clave de API desde las variables de entorno.
// Esto es configurado en vite.config.ts para funcionar en el navegador.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
let initError = '';

if (!API_KEY) {
  initError = "Error de Configuración: La variable de entorno GEMINI_API_KEY no está definida. Para desarrollo local, cree un archivo `.env` o `.env.local` en la raíz del proyecto y añada `GEMINI_API_KEY=SU_CLAVE_AQUI`. Para producción, configure la variable de entorno en su proveedor de hosting.";
  console.warn(initError);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    initError = "Error al inicializar la API de Gemini. Verifique que su GEMINI_API_KEY sea correcta.";
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
    return { success: false, data: initError || "El cliente de IA no está disponible. Verifique la configuración de la GEMINI_API_KEY." };
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

    const text = response.text ?? '';
    return { success: true, data: text.trim() };
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    let errorMessage = "Hubo un error al generar la descripción. Por favor, inténtelo de nuevo o escríbala manualmente.";
     if (error instanceof Error && error.message.includes('API key not valid')) {
        errorMessage = "Error: La clave de API proporcionada no es válida. Por favor, verifíquela en la variable de entorno GEMINI_API_KEY.";
    }
    return { success: false, data: errorMessage };
  }
};