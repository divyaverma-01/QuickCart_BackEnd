import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        selectedVariants: [
          {
            name: String,
            value: String,
            priceModifier: Number,
          },
        ],
        // Add merchant reference at the product level for clarity (optional, since Product already references merchant)
        // merchant: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "User",
        // },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    //order status
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "refund", "cancelled"],
      default: "pending",
    },

    shipping: {
      name: String,
      amount: Number,
    },

    tax: {
      name: String,
      amount: Number,
    },

    paymentInfo: {
      razorpayPaymentId: { type: String },
      razorpayOrderId: { type: String },
      razorpaySignature: { type: String },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },

    // Add transfer details for each merchant (for split payments)
    transfers: [
      {
        merchant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: Number,
        commission: Number,
        transferId: String, // Razorpay transfer ID
        status: {
          type: String,
          enum: ["pending", "success", "failed"],
          default: "pending",
        },
        reason: String,
      },
    ],

    // discount: {

    // },

    // paymentMethod: {
    //   type: String,
    //   enum: ["razorpay", "cod"],
    //   default: "razorpay",
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

//razorpayOrderId
