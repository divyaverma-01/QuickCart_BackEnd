import Order from "../models/order.js";

//Create a new order
export const createOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { products, total, shippingAddress } = req.body;
    if (!products || !total || !shippingAddress) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const order = new Order({
      user: req.user._id, //from authMiddleware
      products,
      total,
      shippingAddress,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
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

//Fetch all orders in the system
export const getAllOrders = async (req, res) => {
  try {
    const order = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("products.product", "name basePrice images");

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//get user order by id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("user", "firstName lastName email")
      .populate("products.product", "name basePrice images");

    if (!order) return res.status(404).json({ error: "Order not found" });
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
