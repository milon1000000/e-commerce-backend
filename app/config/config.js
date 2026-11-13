import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const DATABASE =
  process.env.DATABASE ||
  "mongodb+srv://milon:ZBQ3Z0lqzgLFeBec@mahinur.objho.mongodb.net/e-commerce";
export const JWT_KEY = process.env.JWT_KEY || "ABC12341241234";
export const JWT_EXPIRE_TIME = process.env.JWT_EXPIRE_TIME || "30d";

export const EMAIL_HOST = process.env.EMAIL_HOST || "mail.teamrabbil.com";
export const EMAIL_PORT = process.env.EMAIL_PORT || 25;
export const EMAIL_SECURITY = false;
export const EMAIL_USER =
  process.env.EMAIL_USER || "milonmondolmd33@gmail.com";
export const EMAIL_PASS = process.env.EMAIL_PASS || "ynfw hqge jyjo xvhb";
export const EMAIL_UN_AUTH = false;

export const WEB_CACHE = false;
export const MAX_JSON_SIZE = "10MB";
export const URL_ENCODE = true;

export const REQUEST_TIME = 20 * 60 * 1000;
export const REQUEST_NUMBER = 2000;
