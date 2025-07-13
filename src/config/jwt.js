import { configDotenv } from "dotenv";
configDotenv();
export const JWT_SECRET = process.env.JWT_SECRET_KEY; // Always use env in production!
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
