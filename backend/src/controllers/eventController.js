import Event from "../models/Events.js";
import User from "../models/User.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      location,
      maxAttendees,
    } = req.body;

    if (!title || !category || !date || !time || !venue || !maxAttendees) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const eventData = {
      title,
      description,
      category,
      date,
      time,
      venue,
      maxAttendees,
      location,
      organizer: req.user._id,
    };

    if (req.file) {
      eventData.image = req.file.path;
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
    const events = await Event.find().populate("organizer", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");

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
    if (event.organizer.toString() !== req.user._id.toString()) {
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
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const applyToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    event.attendees.push(userId);
    await event.save();

    const user = await User.findById(userId);
    user.joinedEvents.push(eventId);
    await user.save();

    res.json({ message: "Successfully joined the event", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "attendees",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ participants: event.attendees });
  } catch (error) {
    console.error("Error in getEventParticipants:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchEvents = async (req, res) => {
  try {
    const { title, venue, lat, lng, radius } = req.query;

    let query = {};

    if (title) query.title = { $regex: title, $options: "i" };
    if (venue) query.venue = { $regex: venue, $options: "i" };

    let events;

    if (lat && lng && radius) {
      events = await Event.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
      }).populate("organizer", "name email");
    } else {
      events = await Event.find(query).populate("organizer", "name email");
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");

    if (!event) return res.status(404).json({ message: "Event not found" });

    const isJoined = req.user
      ? event.attendees.some(
          (p) => p._id.toString() === req.user._id.toString()
        )
      : false;

    res.json({ event, isJoined });
  } catch (error) {
    console.error("Error in getEventDetails:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyCreatedEvents = async (req, res) => {
  try {
    // req.user._id => login sonrası middleware ile atanmış user id
    const myEvents = await Event.find({ organizer: req.user._id });
    res.json(myEvents);
  } catch (error) {
    console.error("Error fetching my events:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyJoinedEventsIds = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("joinedEvents");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ joinedEventIds: user.joinedEvents });
  } catch (error) {
    console.error("Error fetching joined events:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
