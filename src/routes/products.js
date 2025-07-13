import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductVariants,
} from "../controllers/productController.js";

const router = express.Router();

// Product CRUD routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Variant-specific route
router.get("/:id/variants", getProductVariants);

//protected route
router.use(authMiddleware, isAdmin); //middleware
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
