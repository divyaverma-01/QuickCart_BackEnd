//merchant events

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["order", "custom", "restock", "promo"],
      default: "custom",
    },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
