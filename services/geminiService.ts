import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

export const generateServiceDescription = async (keywords: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve("La clave de API de Gemini no está configurada. Por favor, ingrese la descripción manualmente.");
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
    return "Hubo un error al generar la descripción. Por favor, inténtelo de nuevo o escríbala manually.";
  }
};
