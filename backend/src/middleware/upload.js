import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "event-finder",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage });

export default parser;
