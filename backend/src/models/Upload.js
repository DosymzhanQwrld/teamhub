import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ["avatar", "project-cover", "task-attachment", "message-attachment"],
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    relatedModel: {
      type: String,
      enum: ["User", "Project", "Task", "Message"],
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
