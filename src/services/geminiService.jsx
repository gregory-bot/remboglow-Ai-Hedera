import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAYFJN7ZsknXGJ8IB4IwN8VouNj9jwQhtg';
const genAI = new GoogleGenerativeAI(API_KEY);

const convertPriceToKES = (priceStr) => {
  if (!priceStr) return priceStr;

  if (priceStr.includes('Ksh') || priceStr.includes('KES')) {
    return priceStr;
  }

  const usdMatch = priceStr.match(/([\d,.]+)\s*(USD|\$)?/i);
  if (usdMatch) {
    const usd = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (!isNaN(usd)) {
      const rate = 130;
      const kes = Math.round(usd * rate);
      return `Ksh ${kes.toLocaleString()}`;
    }
  }
  return priceStr;
};

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

const analyzeImage = async (imageFile, userBudget = 10000) => {
  try {
    console.log("Analyzing image with Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `
You are remboglow, an expert beauty and skincare assistant for African women.

Analyze this person's face in detail and provide:

1. FACIAL ANALYSIS:
   - Exact skin tone (light, medium, dark, deep) with undertones (warm, cool, neutral)
   - Facial shape (oval, round, square, heart, diamond, oblong)
   - Skin concerns visible (acne, dark spots, hyperpigmentation, dryness, oiliness, fine lines, uneven texture)
   - Current makeup style if visible

2. PERSONALIZED SKINCARE ROUTINE:
   - Morning routine (cleanser, toner, serum, moisturizer, sunscreen)
   - Evening routine (cleanser, treatment, night cream)
   - Weekly treatments (masks, exfoliants)
   - Specific products for their skin concerns

3. MAKEUP RECOMMENDATIONS:
   - Foundation shade match for their exact skin tone
   - Lip colors that complement their complexion
   - Eye makeup styles for their face shape
   - Contouring and highlighting placement

4. FASHION STYLE:
   - Colors that enhance their skin tone
   - African fashion styles that suit them (Ankara, contemporary, elegant)
   - Accessories and jewelry recommendations

5. PRODUCT RECOMMENDATIONS:
   User's budget: Ksh ${userBudget}

   Recommend REAL products available in Kenya from these retailers:
   - Jumia Kenya (jumia.co.ke)
   - Kilimall Kenya (kilimall.co.ke)
   - Beauty Click Kenya (beautyclick.co.ke)
   - Zaron Cosmetics (zaroncosmetics.com)
   - Huddah Cosmetics (huddahcosmetics.com)

   Include products from brands like:
   - The Ordinary, CeraVe, Neutrogena (skincare)
   - Fenty Beauty, Maybelline, L'Oréal, MAC (makeup)
   - Zaron, Huddah (local brands)

   Each product MUST include:
   - Exact product name
   - Real purchase URL from a Kenyan retailer
   - Actual price in KES (within user's budget)
   - Why it's recommended for this specific person

CRITICAL: Respond with ONLY valid JSON in this exact format:

{
  "skinAnalysis": {
    "skinTone": "deep with warm undertones",
    "undertone": "warm",
    "facialShape": "oval",
    "skinType": "combination",
    "concerns": ["hyperpigmentation", "uneven texture", "dark spots"],
    "currentLook": "minimal makeup, natural look"
  },
  "skincareRoutine": {
    "morning": [
      {
        "step": "Cleanser",
        "product": "CeraVe Hydrating Facial Cleanser",
        "reason": "Gentle, non-stripping cleanser for combination skin"
      },
      {
        "step": "Vitamin C Serum",
        "product": "The Ordinary Vitamin C Suspension 23%",
        "reason": "Brightens skin and fades hyperpigmentation"
      },
      {
        "step": "Moisturizer",
        "product": "Neutrogena Hydro Boost Water Gel",
        "reason": "Lightweight hydration without greasiness"
      },
      {
        "step": "Sunscreen",
        "product": "Garnier Ambre Solaire SPF 50",
        "reason": "Essential protection to prevent further dark spots"
      }
    ],
    "evening": [
      {
        "step": "Cleanser",
        "product": "CeraVe Hydrating Facial Cleanser",
        "reason": "Remove makeup and impurities"
      },
      {
        "step": "Treatment",
        "product": "The Ordinary Niacinamide 10% + Zinc 1%",
        "reason": "Reduces dark spots and controls oil"
      },
      {
        "step": "Night Cream",
        "product": "Olay Regenerist Night Recovery Cream",
        "reason": "Deep overnight hydration and repair"
      }
    ],
    "weekly": [
      {
        "step": "Exfoliant",
        "frequency": "2x per week",
        "product": "The Ordinary AHA 30% + BHA 2% Peeling Solution",
        "reason": "Removes dead skin cells and brightens complexion"
      }
    ]
  },
  "makeupRecommendations": {
    "foundation": "Fenty Beauty Pro Filt'r in shade 450 or Maybelline Fit Me in 355",
    "concealer": "LA Girl Pro Conceal in Deep Cocoa",
    "lipColor": "Berry, plum, and warm nude shades - Try Zaron Matte Liquid Lipstick",
    "eyeMakeup": "Warm bronze and copper tones, black eyeliner",
    "blush": "Terracotta or deep rose shades",
    "highlighter": "Gold or bronze highlighter on cheekbones"
  },
  "fashionRecommendations": {
    "bestColors": ["warm earth tones", "burnt orange", "deep purple", "emerald green", "gold"],
    "styles": ["Contemporary Ankara prints", "Elegant wrap dresses", "High-waisted pants with crop tops"],
    "accessories": "Gold jewelry, statement earrings, colorful headwraps",
    "patterns": "African wax prints, geometric patterns, bold florals"
  },
  "productRecommendations": [
    {
      "category": "Skincare",
      "brand": "CeraVe",
      "product": "Hydrating Facial Cleanser 236ml",
      "price": "Ksh 2,500",
      "buyUrl": "https://jumia.co.ke/cerave-hydrating-facial-cleanser-236ml.html",
      "reason": "Perfect for your combination skin, won't strip natural oils",
      "isAffordable": true,
      "priority": "essential"
    },
    {
      "category": "Skincare",
      "brand": "The Ordinary",
      "product": "Niacinamide 10% + Zinc 1% 30ml",
      "price": "Ksh 1,800",
      "buyUrl": "https://kilimall.co.ke/new/commodity/26735415",
      "reason": "Targets your hyperpigmentation and dark spots effectively",
      "isAffordable": true,
      "priority": "essential"
    },
    {
      "category": "Makeup",
      "brand": "Maybelline",
      "product": "Fit Me Matte + Poreless Foundation 355",
      "price": "Ksh 1,650",
      "buyUrl": "https://jumia.co.ke/maybelline-fit-me-matte-poreless-foundation-355.html",
      "reason": "Perfect match for your deep warm skin tone",
      "isAffordable": true,
      "priority": "recommended"
    }
  ]
}

IMPORTANT RULES:
1. All products MUST be real and available in Kenya
2. Include ACTUAL working purchase URLs from Kenyan retailers
3. Prices MUST be in Kenyan Shillings (Ksh) and realistic
4. Only recommend products within the user's budget of Ksh ${userBudget}
5. Prioritize products that address the person's specific skin concerns
6. NO MOCK DATA - every product must be verifiable and purchasable
7. Include 8-12 product recommendations across skincare and makeup

DO NOT include any text outside the JSON object.`;

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

    try {
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        if (data.productRecommendations && Array.isArray(data.productRecommendations)) {
          data.productRecommendations = data.productRecommendations
            .map((prod) => ({
              ...prod,
              price: convertPriceToKES(prod.price),
              isAffordable: isProductAffordable(prod.price, userBudget)
            }))
            .filter((prod) => prod.isAffordable);
        }

        const requiredFields = ['skinAnalysis', 'skincareRoutine', 'makeupRecommendations'];
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
      throw new Error("Failed to parse AI response. Please try again.");
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      error: true,
      message: "Failed to analyze image. Please check your internet connection and try again.",
    };
  }
};

const generateDailyRoutine = async (userProfile) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are remboglow, a skincare routine expert for African women.

Based on this user's profile:
- Skin Type: ${userProfile.skinType || 'combination'}
- Skin Concerns: ${userProfile.concerns?.join(', ') || 'general care'}
- Budget: Ksh ${userProfile.budget || 5000}

Create a DETAILED daily skincare and makeup routine with REAL products available in Kenya.

Provide a complete routine for:
1. Morning (5-7 steps)
2. Evening (5-7 steps)
3. Weekly treatments (2-3 items)

Each step must include:
- Time of day
- Exact product name and brand
- How to apply it
- Why it's important for their skin
- Real purchase URL from Kenyan retailers (Jumia, Kilimall, Beauty Click)
- Actual price in KES

CRITICAL: Respond with ONLY valid JSON:

{
  "routineSchedule": {
    "morning": [
      {
        "time": "7:00 AM",
        "step": "Cleanse",
        "product": "CeraVe Hydrating Facial Cleanser",
        "brand": "CeraVe",
        "howToUse": "Wet face, apply small amount, massage in circular motions for 60 seconds, rinse with lukewarm water",
        "why": "Removes overnight oils without stripping skin barrier",
        "duration": "2 minutes",
        "price": "Ksh 2,500",
        "buyUrl": "https://jumia.co.ke/cerave-hydrating-cleanser.html"
      }
    ],
    "evening": [
      {
        "time": "9:00 PM",
        "step": "Double Cleanse",
        "product": "Garnier Micellar Water",
        "brand": "Garnier",
        "howToUse": "Soak cotton pad, wipe face to remove makeup and dirt",
        "why": "Removes makeup and prepares skin for deep cleanse",
        "duration": "3 minutes",
        "price": "Ksh 850",
        "buyUrl": "https://jumia.co.ke/garnier-micellar-water.html"
      }
    ],
    "weekly": [
      {
        "frequency": "2x per week (Monday & Thursday)",
        "step": "Exfoliate",
        "product": "The Ordinary AHA 30% + BHA 2%",
        "brand": "The Ordinary",
        "howToUse": "Apply to clean dry face, leave for 10 minutes max, rinse thoroughly",
        "why": "Removes dead skin cells, brightens complexion, unclogs pores",
        "duration": "10 minutes",
        "price": "Ksh 2,200",
        "buyUrl": "https://kilimall.co.ke/ordinary-aha-bha-peeling.html"
      }
    ]
  },
  "tips": [
    "Always apply sunscreen as your last morning step",
    "Wait 1-2 minutes between each product application",
    "Patch test new products on your inner arm first"
  ],
  "estimatedTotalCost": "Ksh 8,500",
  "routineDuration": {
    "morning": "10-12 minutes",
    "evening": "15-18 minutes"
  }
}

IMPORTANT: All products must be real, available in Kenya, with working purchase URLs.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to generate routine');
  } catch (error) {
    console.error("Error generating routine:", error);
    throw error;
  }
};

function isProductAffordable(priceStr, budget = 10000) {
  if (!priceStr) return false;
  const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  return !isNaN(priceNum) && priceNum <= budget;
}

export {
  analyzeImage,
  generateTextResponse,
  generateDailyRoutine,
  convertPriceToKES
};
export default analyzeImage;
