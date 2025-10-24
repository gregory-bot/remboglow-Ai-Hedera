import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAYFJN7ZsknXGJ8IB4IwN8VouNj9jwQhtg';
const genAI = new GoogleGenerativeAI(API_KEY);

// Product database with actual Kenyan retailers
const PRODUCT_DATABASE = {
  "Fenty Beauty": {
    "Pro Filt'r Soft Matte Longwear Foundation": {
      buyUrl: "https://www.beautyclick.co.ke/fenty-beauty-pro-filtr-soft-matte-longwear-foundation",
      imageUrl: "https://www.beautyclick.co.ke/media/catalog/product/cache/6c8e984ce2e2e3926f5812e1088909a9/f/e/fenty-beauty-pro-filtr-soft-matte-longwear-foundation-390.jpg"
    }
  },
  "Zaron": {
    "Matte Liquid Lipstick": {
      buyUrl: "https://zaroncosmetics.com/product/matte-liquid-lipstick/",
      imageUrl: "https://zaroncosmetics.com/wp-content/uploads/2020/08/matte_liquid_lipstick_berry_queen.jpg"
    },
    "Eyeshadow Palette": {
      buyUrl: "https://zaroncosmetics.com/product-category/palettes/",
      imageUrl: "https://zaroncosmetics.com/wp-content/uploads/2020/08/eye_shadow_palette_warm_neutrals_1.jpg"
    }
  },
  "Maybelline": {
    "Fit Me Matte + Poreless Foundation": {
      buyUrl: "https://jumia.co.ke/maybelline-fit-me-matte-poreless-foundation-30ml-42137414.html",
      imageUrl: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/41/37414/1.jpg?4983"
    },
    "Lash Sensational Mascara": {
      buyUrl: "https://jumia.co.ke/maybelline-lash-sensational-mascara-black-49104413.html",
      imageUrl: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/13/44194/1.jpg?5688"
    }
  },
  "Huddah Cosmetics": {
    "Mono Contour": {
      buyUrl: "https://huddahcosmetics.com/product/mono-contour/",
      imageUrl: "https://huddahcosmetics.com/wp-content/uploads/2021/06/MONO-CONTOUR-1-600x600.jpg"
    },
    "Matte Liquid Lipstick": {
      buyUrl: "https://huddahcosmetics.com/product/lip-lacquer/",
      imageUrl: "https://huddahcosmetics.com/wp-content/uploads/2021/06/LIP-LACQUER-1-600x600.jpg"
    }
  },
  "MAC": {
    "Lipstick": {
      buyUrl: "https://www.originbeauty.co.ke/collections/mac-lipsticks",
      imageUrl: "https://www.originbeauty.co.ke/cdn/shop/products/1_2b235d3c-2b6d-4d6e-ba8c-9d0b3c3b3b3b.jpg?v=1624965123"
    }
  }
};

// Helper: Convert USD to KES
function convertPriceToKES(priceStr) {
  if (!priceStr) return priceStr;
  
  // Check if already in KES
  if (priceStr.includes('Ksh') || priceStr.includes('KES')) {
    return priceStr;
  }
  
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`
You are remboglow, a beauty & fashion assistant for African women.  
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

// Enhance product suggestions with real buy links
const enhanceProductSuggestions = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => {
    // Try to find a matching product in our database
    const brandData = PRODUCT_DATABASE[product.brand];
    if (brandData) {
      const productKey = Object.keys(brandData).find(key => 
        product.product && product.product.includes(key)
      );
      
      if (productKey) {
        return {
          ...product,
          buyUrl: brandData[productKey].buyUrl,
          imageUrl: brandData[productKey].imageUrl || product.imageUrl
        };
      }
    }
    
    // If no exact match, try to find a partial match
    for (const [brand, products] of Object.entries(PRODUCT_DATABASE)) {
      if (product.brand && product.brand.includes(brand)) {
        for (const [productName, productData] of Object.entries(products)) {
          if (product.product && product.product.includes(productName)) {
            return {
              ...product,
              buyUrl: productData.buyUrl,
              imageUrl: productData.imageUrl || product.imageUrl
            };
          }
        }
      }
    }
    
    return product;
  });
};

// Analyze image with AI
const analyzeImage = async (imageFile) => {
  try {
    console.log("Analyzing image with Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert image to base64
    const imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `
You are remboglow, a smart beauty and fashion assistant tailored for African women.

Analyze this image and identify:
1. Skin tone (light, medium, dark, deep)
2. Facial shape and features (oval, round, square, heart, diamond, oblong)
3. Visible makeup preferences (if any)
4. Hair style, if visible

Then provide personalized recommendations:
- Complete makeup look: foundation shade, lip color, eye makeup, and accessories. Use locally available brands (Maybelline, Zaron, Fenty, Huddah, MAC)
- Fashion style that complements the skin tone and face shape, considering African trends (Ankara, streetwear, elegant, minimalist)
- Mood or occasion (casual, party, formal, work) that fits the overall look
- Specific product recommendations with shades and estimated prices in KENYAN SHILLINGS (Ksh)

Make recommendations culturally relevant, inclusive, and empowering — emphasize bold, authentic African beauty.

IMPORTANT: Only recommend products that are actually available in Kenya. Include affordable options (products below KSH 10,000).

CRITICAL: You MUST respond with ONLY valid JSON in this exact format:

{
  "skinTone": "deep",
  "facialShape": "oval",
  "currentLook": "description of current look if visible",
  "makeupRecommendations": {
    "foundation": "Fenty Beauty Pro Filt'r Soft Matte Longwear Foundation in 590",
    "lipColor": "Zaron Matte Liquid Lipstick in Berry Queen",
    "eyeMakeup": "Subtle bronze eyeshadow with black eyeliner",
    "accessories": "Gold statement earrings"
  },
  "fashionRecommendations": {
    "style": "Contemporary African chic",
    "colors": "Warm earth tones that complement deep skin",
    "patterns": "Modern Ankara prints",
    "occasion": "Evening event or special occasion"
  },
  "productSuggestions": [
    {
      "brand": "Fenty Beauty",
      "product": "Pro Filt'r Soft Matte Longwear Foundation",
      "shade": "590",
      "price": "Ksh 5,200",
      "isAffordable": true,
      "imageUrl": "https://example.com/fenty-590.jpg"
    }
  ]
}

IMPORTANT: For product prices, ALWAYS use Kenyan Shillings (Ksh) format.

DO NOT include any additional text, explanations, or markdown formatting. ONLY the JSON object.`;

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

    console.log("Gemini AI response received:", text);

    // Try parsing JSON - more robust parsing
    try {
      // Clean the response text first
      let cleanedText = text.trim();
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove any extra text before or after JSON
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        // Normalize prices to KES and filter affordable products
        if (data.productSuggestions && Array.isArray(data.productSuggestions)) {
          data.productSuggestions = data.productSuggestions
            .map((prod) => ({
              ...prod,
              price: convertPriceToKES(prod.price),
              isAffordable: isProductAffordable(prod.price)
            }))
            .filter((prod) => {
              // Only show affordable products (under 10,000 KES)
              return prod.isAffordable;
            });
        }

        // Enhance product suggestions with buy links
        data.productSuggestions = enhanceProductSuggestions(data.productSuggestions);

        // Ensure all required fields are present
        const requiredFields = ['skinTone', 'facialShape', 'makeupRecommendations', 'fashionRecommendations'];
        const hasAllFields = requiredFields.every(field => data[field]);
        
        if (!hasAllFields) {
          throw new Error('Missing required fields in AI response');
        }

        return data;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error("JSON parsing failed:", e);
      
      // Fallback: Try to extract key information from text response
      const fallbackData = {
        skinTone: extractFromText(text, ['skin tone', 'skin']),
        facialShape: extractFromText(text, ['facial shape', 'face shape', 'face']),
        currentLook: extractFromText(text, ['current look', 'visible makeup', 'wearing']),
        makeupRecommendations: {
          foundation: extractFromText(text, ['foundation', 'base']),
          lipColor: extractFromText(text, ['lip', 'lipstick']),
          eyeMakeup: extractFromText(text, ['eye', 'eyeshadow']),
          accessories: extractFromText(text, ['accessories', 'jewelry'])
        },
        fashionRecommendations: {
          style: extractFromText(text, ['fashion style', 'style']),
          colors: extractFromText(text, ['colors', 'color palette']),
          patterns: extractFromText(text, ['patterns', 'prints']),
          occasion: extractFromText(text, ['occasion', 'event'])
        },
        productSuggestions: []
      };
      
      return fallbackData;
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      error: true,
      message: "Failed to analyze image. Please check your internet connection and try again.",
    };
  }
};

// Helper function to check if product is affordable
function isProductAffordable(priceStr) {
  if (!priceStr) return false;
  
  // Extract numeric value from price string
  const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  return !isNaN(priceNum) && priceNum <= 10000;
}

// Helper function to extract information from text response
function extractFromText(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+([^.!?]+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'Not specified';
}

export { analyzeImage, generateTextResponse, convertPriceToKES, enhanceProductSuggestions };
export default analyzeImage;