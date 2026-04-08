import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // 🔥 Import Admin Routes

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- ROUTES ---
app.use("/api/ai", aiRoutes);
app.use("/api/admin/settings", adminRoutes); // 🔥 This creates: /api/admin/settings/update-prompt

const PORT = 8000;
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Ranchi Hospital DB Synced");
    app.listen(PORT, () =>
      console.log(`🚀 Server on http://localhost:${PORT}`),
    );
  } catch (error) {
    console.error("❌ DB Failed:", error.message);
  }
};
startServer();
