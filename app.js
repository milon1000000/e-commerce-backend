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
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
    
    ],
    credentials: true, 
  })
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

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/cart",cartRouter);
app.use("/api/v1/order",orderRoute)


app.get("/", (req, res) => {
  res.json({
    message: "NODE/EXPRESS IS RUNNING!",
  });
});

// MongoDB Connection
// mongoose
//   .connect(DATABASE, { autoIndex: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB connection error:", err));

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(DATABASE);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB error:", err);
  }
};

connectDB();

// Start Server
// app.listen(PORT, () => {
//   console.log("Server started on port " + PORT);
// });

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});


export default app;