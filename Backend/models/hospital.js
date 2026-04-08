import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Hospital = sequelize.define("Hospital", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Ranchi City Hospital",
  },
  gemini_api_key: { type: DataTypes.TEXT, allowNull: true },
  custom_prompt: { type: DataTypes.TEXT, allowNull: true },
  patient_source_url: { type: DataTypes.TEXT },
});

export default Hospital;
