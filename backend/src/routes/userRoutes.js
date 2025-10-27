import express from "express";
import {
  getMyProfile,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute, getMyProfile);

export default router;
