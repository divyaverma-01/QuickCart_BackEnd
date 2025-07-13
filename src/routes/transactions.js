import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Any logged-in user can create a transaction
router.post("/", authMiddleware, createTransaction);

// 🔐 Admin-only
router.get("/", authMiddleware, isAdmin, getAllTransactions);

// 🔐 A user can see their own transaction; or admin can see any
router.get("/:id", authMiddleware, getTransactionById);

// 🔐 Admin-only delete
router.delete("/:id", authMiddleware, isAdmin, deleteTransaction);

// 🔐 Admin-only update (e.g., for status changes)
router.put("/:id", authMiddleware, isAdmin, updateTransaction);

export default router;
