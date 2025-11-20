import express from "express";
import {
  getMyProfile,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute, getMyProfile);
router.put("/me", protectRoute, updateUserProfile);

export default router;
