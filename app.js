import "./polyfill.js";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import {
  DATABASE,
  MAX_JSON_SIZE,
  PORT,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE,
} from "./app/config/config.js";

import userRouter from "./routes/userRoutes.js";
import productRoute from "./routes/productRouters.js";
import cartRouter from "./routes/cartRouters.js";
import orderRoute from "./routes/orderRouters.js";

const app = express();

// CORS setup
const allowedOrigins = [
  "https://frontend-gules-seven-89.vercel.app",
  "https://e-commerce-frontend-9dce.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman), vercel.app domains, allowed origins, or non-production
      const isVercel = origin && (origin.endsWith(".vercel.app") || origin.includes("vercel.app"));
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isVercel ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "user_id", "token"],
  }),
);

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.use(helmet());

// Rate limiter
const limiter = rateLimit({ windowMs: REQUEST_TIME, max: REQUEST_NUMBER });
app.use(limiter);

// Cache
app.set("etag", WEB_CACHE);

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const dbUri = (DATABASE || "").trim().replace(/^["']|["']$/g, "");
  if (!dbUri) {
    console.error("MongoDB error: DATABASE URI is empty");
    return;
  }

  try {
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

// Immediate connection attempt
connectDB();

// Root Health Check (Never times out, always returns 200 on Vercel)
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "E-Commerce Backend API is running successfully on Vercel!",
    database: isConnected || mongoose.connection.readyState === 1 ? "connected" : "connecting or disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Middleware to ensure DB is connected before processing /api/v1 routes
app.use("/api/v1", async (req, res, next) => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler (prevents serverless crash)
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server locally (never on Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
  });
}

export default app;
