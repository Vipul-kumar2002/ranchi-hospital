import { GoogleGenerativeAI } from "@google/generative-ai";
import Hospital from "../models/hospital.js";

export const transcribeHandwriting = async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: "No images provided" });
  }

  try {
    // 🔍 1. FETCH HOSPITAL DATA (API Key + Saved Prompt)
    const hospital = await Hospital.findByPk(1);
    const liveApiKey = hospital?.gemini_api_key;
    const dbPrompt = hospital?.custom_prompt; // 🔥 This is the prompt from your Editor

    if (!liveApiKey) {
      return res.status(400).json({
        message:
          "Gemini API Key missing. Please configure it in Admin Settings.",
      });
    }

    // 🤖 2. INITIALIZE AI
    const genAI = new GoogleGenerativeAI(liveApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 📸 3. MULTIMODAL MAPPING
    const imageParts = images.map((img) => {
      const base64Data = img.includes(",") ? img.split(",")[1] : img;
      return {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };
    });

    // 📝 4. DYNAMIC PROMPT LOGIC
    // If the database has a prompt, use it. If not, use your original one as a fallback.
    const finalPrompt =
      dbPrompt ||
      //       `You are a medical data extraction expert for Ranchi City Hospital.
      // Analyze the prescription images and return ONLY a valid JSON object.

      // STRICT JSON STRUCTURE:
      // {
      //   "patientId": "Extract if present, else null",
      //   "clinicalData": {
      //     "bloodPressure": "Value or Not Mentioned",
      //     "bloodGroup": "Value or Not Mentioned",
      //     "hemoglobin": "Value or Not Mentioned",
      //     "tests": ["List of tests or Not Mentioned"],
      //     "instructions": "Specific medication instructions",
      //     "generalAdvice": "Diet/Lifestyle advice",
      //     "revisit": "Follow up date/days"
      //   },
      //   "medicine": [
      //     {
      //       "medicineName": "Name + Strength",
      //       "dosage": "Frequency (e.g. 1-0-1)",
      //       "instruction": "Translated to English (e.g. After Food)"
      //     }
      //   ]
      // }

      // DO NOT include any conversational text. Return ONLY the JSON.`;

      console.log("🚀 Running Transcription with Database Prompt...");

    // 🚀 5. EXECUTE AI GENERATION
    const result = await model.generateContent([finalPrompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ transcription: text });
  } catch (error) {
    console.error("AI Error:", error);
    if (error.status === 429) {
      return res
        .status(429)
        .json({ message: "AI is busy. Please wait 60 seconds." });
    }
    res
      .status(500)
      .json({ message: "AI Analysis Failed", error: error.message });
  }
};
