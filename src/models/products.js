import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  options: [
    {
      value: { type: String, required: true }, // e.g., "Red", "XL"
      priceModifier: { type: Number, default: 0 }, // Additional cost for this option
      stock: { type: Number, required: true }, // Stock for this specific variant
    },
  ],
});

//merchant id add
//prepaid or cod
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    merchant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
    basePrice: { type: Number, required: true }, // Renamed from 'price' to be clearer
    category: { type: String },
    description: { type: String },
    images: [{ type: String }], // Changed to array for multiple images
    variants: [variantSchema], // Array of variant types
    totalStock: { type: Number }, // Auto-calculated field
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Calculate total stock before saving
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, variant) => {
      return (
        sum +
        variant.options.reduce((optSum, option) => optSum + option.stock, 0)
      );
    }, 0);
  } else {
    this.totalStock = 0;
  }
  next();
});

export default mongoose.model("Product", productSchema);
