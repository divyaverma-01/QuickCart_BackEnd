import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware, isAdmin);

// Create event
router.post("/", createEvent);
// Get all events for merchant
router.get("/", getEvents);
// Get single event
router.get("/:id", getEventById);
// Update event
router.put("/:id", updateEvent);
// Delete event
router.delete("/:id", deleteEvent);

export default router;
