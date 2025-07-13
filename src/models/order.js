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
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered"],
      default: "pending",
    },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    paymentInfo: {
      method: String, // e.g., "COD", "Stripe"
      paymentId: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
