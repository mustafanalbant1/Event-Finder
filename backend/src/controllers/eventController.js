import Event from "../models/Events.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, address, coordinates } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const eventData = {
      title,
      description,
      date,
      venue,
      address,
      createdBy: req.user._id,
    };

    // 🧭 Koordinat kontrolü
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      eventData.location = { type: "Point", coordinates };
    }

    // 🖼️ Görsel varsa ekle
    if (req.file) {
      eventData.image = req.file.path; // Cloudinary veya upload URL
    }

    const event = await Event.create(eventData);

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error in createEvent:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Event updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const applyToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    event.participants.push(userId);
    await event.save();

    res.json({ message: "Successfully joined the event", event });
  } catch (error) {
    console.error("Error in applyToEvent:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "participants",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ participants: event.participants });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchEvents = async (req, res) => {
  try {
    const { title, venue, lat, lng, radius } = req.query;

    let query = {};

    // Başlık ve mekan için regex arama
    if (title) query.title = { $regex: title, $options: "i" };
    if (venue) query.venue = { $regex: venue, $options: "i" };

    let events;

    // Konum filtreleme
    if (lat && lng && radius) {
      events = await Event.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radius) * 1000, // km → m
          },
        },
      }).populate("createdBy", "name email");
    } else {
      events = await Event.find(query).populate("createdBy", "name email");
    }

    res.json(events);
  } catch (error) {
    console.error("Error in searchEvents:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isJoined = req.user
      ? event.participants.some(
          (p) => p._id.toString() === req.user._id.toString()
        )
      : false;

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.venue,
        address: event.address,
        createdBy: event.createdBy,
        participants: event.participants,
      },
      isJoined,
    });
  } catch (error) {
    console.error("Error in getEventDetails:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
