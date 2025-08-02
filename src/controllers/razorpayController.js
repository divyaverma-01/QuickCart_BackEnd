import razorpay from "../config/razorpay.js";
import axios from "axios";
import crypto from "crypto";
import Order from "../models/order.js";
import Product from "../models/products.js";
import User from "../models/user.js";
import { configDotenv } from "dotenv";
configDotenv();

// Create Payment Order
export const createOrder = async (req, res) => {
  try {
    const options = req.body; // amount, currency, receipt, etc.
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Create Linked Account
export const createLinkedAccount = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.razorpay.com/v2/accounts",
      req.body,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};

//  Submit KYC Documents
export const submitKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.patch(
      `https://api.razorpay.com/v2/accounts/${id}`,
      req.body,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};

// Track Onboarding Status
export const getLinkedAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.razorpay.com/v2/accounts/${id}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};

// Webhook Endpoint - Handles Razorpay payment events
export const handleWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const isValid = verifyRazorpaySignature(req.body, signature, secret);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  // Handle event types (e.g., payment.authorized, order.paid)
  // ✅ Now safe to process webhook
  const event = req.body.event;
  console.log(`Processing webhook event: ${event}`);

  switch (event) {
    case "payment.captured":
    case "order.paid":
      handlePaymentSuccess(req, res);
      break;

    case "payment.failed":
      handlePaymentFailure(req, res);
      break;

    case "refund.processed":
      handleRefundProcessed(req, res);
      break;

    default:
      console.log(`Unhandled webhook event: ${event}`);
      res.status(200).json({ status: "ok", message: "Event not handled" });
  }
};

// Handle successful payment and split transfers
const handlePaymentSuccess = async (req, res) => {
  try {
    const razorpayOrderId = req.body.payload.payment.entity.order_id;
    const razorpayPaymentId = req.body.payload.payment.entity.id;

    // Find the order in DB
    const order = await Order.findOne({
      "paymentInfo.razorpayOrderId": razorpayOrderId,
    }).populate("products.product");

    if (!order) {
      console.log(`Order not found for Razorpay order ID: ${razorpayOrderId}`);
      return res.status(404).json({ error: "Order not found" });
    }

    // Group products by merchant and calculate totals
    const merchantMap = {};
    for (const item of order.products) {
      const product = item.product;
      const merchantId = product.merchant.toString();
      if (!merchantMap[merchantId]) {
        merchantMap[merchantId] = {
          amount: 0,
          products: [],
          merchant: product.merchant,
        };
      }

      // Calculate price for this product (basePrice + variant modifiers) * quantity
      let price = product.basePrice;
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        for (const variant of item.selectedVariants) {
          price += variant.priceModifier || 0;
        }
      }
      merchantMap[merchantId].amount += price * item.quantity;
      merchantMap[merchantId].products.push(item);
    }

    // Calculate commission and create transfers for each merchant
    const commissionRate = 0.1; // 10% commission
    const transfers = [];

    for (const merchantId in merchantMap) {
      const merchantUser = await User.findById(merchantId);
      if (!merchantUser || !merchantUser.razorpayAccountId) {
        console.log(
          `Merchant ${merchantId} missing Razorpay account for order ${order._id}`
        );
        transfers.push({
          merchant: merchantId,
          amount: 0,
          commission: 0,
          transferId: null,
          status: "failed",
          error: "Missing Razorpay account",
        });
        continue;
      }

      const gross = merchantMap[merchantId].amount;
      const commission = Math.round(gross * commissionRate);
      const net = gross - commission;

      // Create Razorpay transfer
      try {
        const transfer = await razorpay.payments.transfer(
          req.body.payload.payment.entity.id,
          [
            {
              account: merchantUser.razorpayAccountId,
              amount: net * 100, // in paise
              currency: "INR",
              notes: { orderId: order._id.toString(), merchantId },
            },
          ]
        );
        transfers.push({
          merchant: merchantUser._id,
          amount: net,
          commission,
          transferId: transfer.items[0].id,
          status: transfer.items[0].status,
        });
        console.log(
          `Transfer created for merchant ${merchantId}: ${transfer.items[0].id}`
        );
      } catch (err) {
        console.error(`Transfer failed for merchant ${merchantId}:`, err);
        // Log or handle transfer error
        transfers.push({
          merchant: merchantUser._id,
          amount: net,
          commission,
          transferId: null,
          status: "failed",
          error: err.message,
        });
      }
    }

    // Update order with payment info and transfers
    order.status = "processing";
    order.paymentInfo.paymentStatus = "paid";
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.transfers = transfers;
    await order.save();

    console.log(
      `Order ${order._id} updated successfully with ${transfers.length} transfers`
    );
    res
      .status(200)
      .json({ status: "ok", message: "Payment processed successfully" });
  } catch (error) {
    console.error("Error processing payment success:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle payment failure
const handlePaymentFailure = async (req, res) => {
  try {
    const razorpayOrderId = req.body.payload.payment.entity.order_id;

    const order = await Order.findOne({
      "paymentInfo.razorpayOrderId": razorpayOrderId,
    });
    if (order) {
      order.status = "cancelled";
      order.paymentInfo.paymentStatus = "failed";
      await order.save();
      console.log(`Order ${order._id} marked as failed`);
    }

    res.status(200).json({ status: "ok", message: "Payment failure handled" });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle refund processed
const handleRefundProcessed = async (req, res) => {
  try {
    const razorpayPaymentId = req.body.payload.refund.entity.payment_id;

    const order = await Order.findOne({
      "paymentInfo.razorpayPaymentId": razorpayPaymentId,
    });
    if (order) {
      order.status = "refund";
      await order.save();
      console.log(`Order ${order._id} marked as refunded`);
    }

    res.status(200).json({ status: "ok", message: "Refund processed" });
  } catch (error) {
    console.error("Error handling refund:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Razorpay signature
const verifyRazorpaySignature = (body, razorpaySignature, secret) => {
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(body));
  const digest = shasum.digest("hex");
  return digest === razorpaySignature;
};

// Verify payment (frontend verification)
export const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Signature" });
  }

  // Update order status as paid
  res.json({ success: true });
};

// Adjust request body validation as per your needs and Razorpay docs.
// For KYC, you may need to handle file uploads (use multer or similar).
