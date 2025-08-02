import express from "express";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/order";
import profileRoutes from "./routes/profile"; //profile
import transactionRoutes from "./routes/transactions";
import dashboardRoutes from "./routes/dashboard.js";
import uploadProductImageRoute from "./routes/uploadProductImage";
import uploadProfileImageRoute from "./routes/uploadProfileImage";
import eventRoutes from "./routes/events";
import razorpayRoutes from "./routes/razorpay";

import cors from "cors"; // profile image ke liye
import { authMiddleware } from "./middleware/authMiddleware.js";
import { databaseConnection } from "./config/db";
import { configDotenv } from "dotenv";

configDotenv(); // initialize env(environment variable)

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// app.use(cors());
app.use(express.json()); // Increased for image uploads

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

//Routes
app.use("/api/auth", authRoutes); //routes??
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload/product-image", uploadProductImageRoute);
app.use("/api/upload/profile-image", uploadProfileImageRoute);
app.use("/api/events", eventRoutes);
app.use("/api/razorpay", razorpayRoutes);

//Home route
app.get("/", (req, res) => {
  try {
    res.send({ ok: true, message: "Sever is running" });
  } catch (error) {
    res.send({ ok: false, error: error?.message });
  }
});

app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user }); // Set by authMiddleware via cookie token
});

// Error handling middleware (always last)
app.use((err, req, res, next) => {
  console.error("Server Error: ", err.stack);

  //special handling for supabase errors
  if (err.name === "StorageError") {
    return res.status(502).json({
      error: "Storage service error",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }

  res.status(500).json({ error: err.message });
});

//server entry point or server startup
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  databaseConnection();
  console.log(`Server running on port ${PORT}`);
});

//Basic structure for adding a route for anything in app
/*
import express from 'express';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

app.use(express.json());
app.use('/api/orders', orderRoutes); // All order routes start with /api/orders

app.listen(5000, () => console.log('Server running on port 5000'));
*/
