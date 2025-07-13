import express from "express";

import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController";

const router = express.Router();

// Customer Routes
router.post("/", authMiddleware, createOrder); // create new order
router.get("/my-orders", authMiddleware, getUserOrders); //get all user orders
router.get("/:id", authMiddleware, getOrderById); // get user order by Id

// Admin Routes
router.get("/", authMiddleware, isAdmin, getAllOrders);
router.put("/:id/status", authMiddleware, isAdmin, updateOrderStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteOrder);

export default router;
