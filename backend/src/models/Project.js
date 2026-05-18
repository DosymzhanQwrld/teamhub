import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["planning", "active", "completed", "archived"],
      default: "planning"
    },
    coverUrl: {
      type: String,
      default: ""
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    dueDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
