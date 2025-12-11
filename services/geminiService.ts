import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
// Note: In a production environment, you should proxy requests through a backend
// to keep your API key secure. For this demo, we use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for Model Names
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-pro-preview';

/**
 * Generates or edits an interior design image based on a prompt and an original image.
 * Uses Gemini 2.5 Flash Image.
 */
export const generateDesign = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_EDIT,
      contents: {
        parts: [
          {
            text: `Act as an expert interior designer. Transform the attached room image based on this style or instruction: "${prompt}". Maintain the structural integrity of the room (windows, doors, walls) but change the decor, furniture, colors, and lighting to match the requested style. Return ONLY the image.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    });

    // Check for inline image data in response
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.find(p => p.inlineData);

    if (part && part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

/**
 * Chat with the interior design assistant.
 * Uses Gemini 3 Pro for high-quality reasoning and shopping advice.
 */
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  currentImage?: string
): Promise<string> => {
  try {
    // Prepare the contents. If there's an image context, we should include it
    // so the model knows what it's talking about.
    // However, keeping simple chat history with the current prompt is usually sufficient for text.
    // To make it truly context-aware of the *visuals*, we send the image with the latest prompt.

    const contents: any[] = [];
    
    // Add context instructions if it's a fresh chat, or rely on system instruction if supported effectively.
    // Here we just append the latest message.
    
    const parts: any[] = [{ text: newMessage }];

    if (currentImage) {
      const cleanBase64 = currentImage.split(',')[1] || currentImage;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    // We use generateContent for a single turn with context, or we could manage a Chat session.
    // Since we want to pass the image every time to ensure it sees the *current* design,
    // a single generateContent call with previous history as context text is often easier,
    // or we just send the current image + prompt.
    
    // Let's use a fresh generation for the answer to ensure it sees the current image state.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: "You are a helpful Interior Design Consultant. Provide specific advice, suggested color palettes, and describe items to buy. If the user asks for links, suggest specific search terms or well-known retailers, as you cannot browse the live web for real-time inventory. Keep answers concise and helpful."
      }
    });

    return response.text || "I couldn't generate a response.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the design server right now.";
  }
};
