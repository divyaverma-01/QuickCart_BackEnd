import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import User from "../models/user.js"; // importing user model

configDotenv();

console.log(JWT_SECRET, "yes"); //just used as a check
//const users = []; --> Simulate DB: The users array works for testing, but you’ll replace it with a real database (MongoDB/PostgreSQL) soon.

//Register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    //Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    //Create new user
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      role: role || "user",
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });

    //users.push({ username, password: hashed, role: "user" }); -- was used with users array for simulated DB
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Registration failed",
    });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    //Find User in database
    const user = await User.findOne({ email });
    //const user = users.find((u) => u.username === username); ---> used for Temporary testing or mock data like users array

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    //verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    //Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    //response with token
    res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Login failed",
    });
  }
};
