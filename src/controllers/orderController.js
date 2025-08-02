import Order from "../models/order";
import Product from "../models/products";

//Create a new order
export const createOrder = async (req, res) => {
  try {
    const { products, total, subtotal, shippingAddress, shipping, tax } =
      req.body;
    if (!products || !total || !shippingAddress) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const order = new Order({
      user: req.user._id, //from authMiddleware
      // Remove merchantId since order model now supports multi-merchant
      products,
      total,
      subtotal,
      shippingAddress,
      shipping,
      tax,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

//Fetch only the orders of the currently logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//Fetch all orders in the system of the logged in user
export const getAllOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      //This will return all orders that include at least one product owned by the merchant.

      // 1. Find all product IDs for this merchant
      const merchantProducts = await Product.find({
        merchant: req.user._id,
      }).select("_id");
      const merchantProductIds = merchantProducts.map((p) => p._id);

      // 2. Find all orders that contain at least one of these products
      orders = await Order.find({
        "products.product": { $in: merchantProductIds },
      })
        .populate("user", "firstName lastName email")
        .populate("products.product", "name basePrice images merchant");
    } else {
      // If regular user, fetch only their orders
      orders = await Order.find({ user: req.user._id })
        .populate("user", "firstName lastName email")
        .populate("products.product", "name basePrice images merchant");
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
//get user order by id
export const getOrderById = async (req, res) => {
  try {
    let order;
    if (req.user.role === "admin") {
      // Admin/merchant: Use the same logic as getAllOrders for consistency

      // 1. Find all product IDs for this merchant
      const merchantProducts = await Product.find({
        merchant: req.user._id,
      }).select("_id");
      const merchantProductIds = merchantProducts.map((p) => p._id.toString());

      // 2. Find the order and check if it contains any of the merchant's products
      order = await Order.findById(req.params.id)
        .populate("user", "firstName lastName email")
        .populate("products.product", "name basePrice images merchant");

      if (!order) return res.status(404).json({ error: "Order not found" });

      // 3. Check if order contains any products owned by this merchant
      const containsMerchantProduct = order.products.some((item) =>
        merchantProductIds.includes(item.product._id.toString())
      );

      if (!containsMerchantProduct) {
        console.log(
          "❌ Authorization failed - no merchant products found in order"
        );
        return res
          .status(403)
          .json({ error: "Not authorized to view this order" });
      }
    } else {
      // Regular user: can only view their own orders
      order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      })
        .populate("user", "firstName lastName email")
        .populate("products.product", "name basePrice images merchant");
      if (!order) return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Instead of findByIdAndDelete, you might use isDeleted: Boolean for analytics/history.
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
