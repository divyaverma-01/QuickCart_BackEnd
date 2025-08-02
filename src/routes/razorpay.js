import express from "express";
import {
  createLinkedAccount,
  submitKyc,
  getLinkedAccountStatus,
  createOrder,
  handleWebhook,
  verifyPayment,
} from "../controllers/razorpayController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// 1. Create Linked Account — Only **admin** should do this (for onboarding sellers)
router.post("/linked-account", authMiddleware, isAdmin, createLinkedAccount);

// 2. Submit KYC — Only **admin** should do this (automating KYC on behalf of sellers)
router.post("/linked-account/:id/kyc", authMiddleware, isAdmin, submitKyc);

// 3. Get Linked Account Status — Only **admin** should check onboarding progress
router.get(
  "/linked-account/:id/status",
  authMiddleware,
  isAdmin,
  getLinkedAccountStatus
);

// 4. Create Payment Order — Requires **authenticated user** (customer initiating a payment)
router.post("/order", authMiddleware, createOrder);

// 5. Verify Payment — Requires **authenticated user** (frontend verification after payment)
router.post("/verify-payment", authMiddleware, verifyPayment);

// 6. Webhook Handler — No auth (Razorpay sends events directly)
router.post("/webhook", handleWebhook);

export default router;
