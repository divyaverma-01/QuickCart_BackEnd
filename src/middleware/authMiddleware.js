//authMiddleware is a gatekeeper — it protects your routes by making sure only authenticated users (with a valid token) can access them.

import jwt from "jsonwebtoken";
import User from "../models/user";

export const authMiddleware = async (req, res, next) => {
  //Check for token in headers
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    //console.log(process.env.JWT_SECRET_KEY, token);
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    //Find user and attach to request
    //console.log(decoded);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid Token: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("auth error", error);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next(); // User is admin — proceed to next middleware/route handler
  } else {
    res.status(403).json({ message: "Admin access required" }); // Forbidden access
  }
};
