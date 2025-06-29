import express from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController";

const router = express.Router();

router.post("/", authMiddleware, createOrder); // create new order
router.get("/:id", authMiddleware, getOrderById); // get user order by Id
router.get("/my-orders", authMiddleware, getUserOrders); //get all user orders
// router.put("/:id/status", updateOrderStatus);
// router.delete("/:id", deleteOrder);
// // Only for admin
// router.get("/", isAuthenticated, isAdmin, getAllOrders);

export default router;
