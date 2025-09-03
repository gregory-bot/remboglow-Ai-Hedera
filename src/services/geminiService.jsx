import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAYFJN7ZsknXGJ8IB4IwN8VouNj9jwQhtg';
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper: Convert USD to KES
function convertPriceToKES(priceStr) {
  if (!priceStr) return priceStr;
  const usdMatch = priceStr.match(/([\d,.]+)\s*(USD|\$)?/i);
  if (usdMatch) {
    const usd = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (!isNaN(usd)) {
      const rate = 130; // static conversion rate
      const kes = Math.round(usd * rate);
      return `Ksh ${kes.toLocaleString()}`;
    }
  }
  return priceStr;
}

// Generate chatbot text (brief responses)
const generateTextResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`
You are Face-Fit AI, a beauty & fashion assistant for African women.  
Always answer in **1–2 short, clear sentences only**.  
Be concise, friendly, and empowering.  

User: "${prompt}"
    `);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text response:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
};

// Analyze image with AI
const analyzeImage = async (imageFile) => {
  try {
    console.log("Analyzing image with Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert image to base64
    const imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `
You are Face-Fit AI, a smart fashion & beauty assistant for African women.  

Analyze this image and give results in **JSON only** with this structure:
{
  "skinTone": "...",
  "facialShape": "...",
  "currentLook": "...",
  "makeupRecommendations": { "foundation": "...", "lipColor": "...", "eyeMakeup": "...", "accessories": "..." },
  "fashionRecommendations": { "style": "...", "colors": "...", "patterns": "...", "occasion": "..." },
  "productSuggestions": [
    { "brand": "...", "product": "...", "shade": "...", "price": "...", "isAffordable": true, "imageUrl": "https://...", "buyLink": "https://..." }
  ]
}

Rules for productSuggestions:
- Include **3–5 real products available in Kenya**.  
- Each must include: brand, product name, shade (if any), price, imageUrl, and buyLink.  
- Only suggest products ≤ **KSh 6000**.  
- Prefer affordable options.  
- buyLink must point to an actual Kenyan online store (Jumia, Supercosmetics, BeautyClick, etc.).  
- Keep text fields **very brief (max 1–2 sentences)**.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini AI response received");

    // Try parsing JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        // Normalize prices to KES
        if (data.productSuggestions && Array.isArray(data.productSuggestions)) {
          data.productSuggestions = data.productSuggestions
            .map((prod) => ({
              ...prod,
              price: convertPriceToKES(prod.price),
            }))
            .filter((prod) => {
              const num = parseInt(prod.price.replace(/[^0-9]/g, ""), 10);
              return !isNaN(num) && num <= 6000;
            });
        }

        return data;
      } else {
        return { analysis: text, error: false };
      }
    } catch (e) {
      console.log("JSON parsing failed, returning raw text");
      return { analysis: text, error: false };
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      error: true,
      message:
        "Failed to analyze image. Please check your internet connection and try again.",
    };
  }
};

export { analyzeImage, generateTextResponse, convertPriceToKES };
export default analyzeImage;
