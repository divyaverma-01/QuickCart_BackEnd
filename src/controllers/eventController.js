import Event from "../models/events.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, type, relatedOrder } = req.body;
    const merchantId = req.user._id;
    const event = new Event({
      merchantId,
      title,
      description,
      date,
      type,
      relatedOrder,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create event", details: error.message });
  }
};

// Get all events for the logged-in merchant
export const getEvents = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const events = await Event.find({ merchantId });
    res.json(events);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch events", details: error.message });
  }
};

// Get a single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      merchantId: req.user._id,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch event", details: error.message });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, type, relatedOrder } = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, merchantId: req.user._id },
      { title, description, date, type, relatedOrder },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update event", details: error.message });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      merchantId: req.user._id,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete event", details: error.message });
  }
};
