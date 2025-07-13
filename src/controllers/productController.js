import Product from "../models/products";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Products
//add pagination
//http://localhost:3001/api/products/
export const getAllProducts = async (req, res) => {
  try {
    const { category, active } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (active) filter.isActive = active === "true";

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get Single Product
//http://localhost:3001/api/products/1
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update Product
//http://localhost:3001/api/products/1
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Product
//http://localhost:3001/api/products/1
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Get Product Variants
//http://localhost:3001/api/products/1/variants
export const getProductVariants = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product.variants || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch variants" });
  }
};
