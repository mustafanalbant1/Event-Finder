import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  applyToEvent,
  getEventParticipants,
  searchEvents,
  getEventDetails,
} from "../controllers/eventController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import parser from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", protectRoute, parser.single("image"), createEvent);

router.get("/search", searchEvents);
router.get("/:id", getEventById);

router.put("/:id", protectRoute, updateEvent);
router.delete("/:id", protectRoute, deleteEvent);
router.post("/:id/apply", protectRoute, applyToEvent);
router.get("/:id/participants", getEventParticipants);

router.get("/:id/details", protectRoute, getEventDetails);

export default router;
