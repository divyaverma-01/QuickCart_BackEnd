import Order from "../models/order.js";
import Product from "../models/products.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Check connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.DATABASE_URL);
    }

    // Total sales (sum of all order amounts)
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Order count by status
    const orderCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Product statistics
    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          outOfStock: {
            $sum: {
              $cond: [{ $lte: ["$countInStock", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminUsers: {
            $sum: {
              $cond: [{ $eq: ["$isAdmin", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      orders: {
        total: orderCounts.reduce((acc, curr) => acc + curr.count, 0),
        byStatus: orderCounts,
      },
      products: {
        ...productCounts[0],
        recent: await Product.find().sort({ createdAt: -1 }).limit(5),
      },
      users: userStats[0],
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};
