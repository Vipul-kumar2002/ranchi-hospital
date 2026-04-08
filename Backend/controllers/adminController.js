import Hospital from "../models/hospital.js";

// 1. Get all hospital settings (Key + Prompt + Patient Source)
export const getHospitalInfo = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(1);
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Save the Custom Prompt
export const updatePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    const hospital = await Hospital.findByPk(1);
    if (hospital) {
      hospital.custom_prompt = prompt;
      await hospital.save();
      return res
        .status(200)
        .json({ success: true, message: "Prompt updated!" });
    }
    res.status(404).json({ success: false, message: "Hospital not found" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Save the API Key
export const updateApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const hospital = await Hospital.findByPk(1);
    if (hospital) {
      hospital.gemini_api_key = apiKey;
      await hospital.save();
      return res
        .status(200)
        .json({ success: true, message: "API Key updated!" });
    }
    res.status(404).json({ success: false, message: "Hospital not found" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 4. NEW: Save the Patient Source URL
export const updatePatientSource = async (req, res) => {
  try {
    const { url } = req.body;
    const hospital = await Hospital.findByPk(1);
    if (hospital) {
      hospital.patient_source_url = url; // Make sure this field exists in your Hospital Model
      await hospital.save();
      return res
        .status(200)
        .json({ success: true, message: "Source URL updated!" });
    }
    res.status(404).json({ success: false, message: "Hospital not found" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
