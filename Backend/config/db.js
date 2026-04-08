import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Use the DATABASE_URL from Render, or fallback to your local settings for testing
export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Render/External DBs
        },
      },
    })
  : new Sequelize(
      "hospital_db_g7x0", // Your DB Name
      "vipul", // Your DB User
      "rh3ae5IWhaHhslleeLHrl6tFCnAz9WL9", // Your DB Password
      {
        host: "dpg-d7b3gj8gjchc73a508ag-a.oregon-postgres.render.com",
        dialect: "postgres",
        logging: false,
      },
    );
