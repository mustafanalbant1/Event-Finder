import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    avatar: { type: String, default: "1" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
