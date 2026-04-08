import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "ranchi_hospital_db",
  "postgres",
  "8340275873", // 🔥 Replace with your PostgreSQL password
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  },
);
