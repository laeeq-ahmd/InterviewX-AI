import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    customizedText: {
      type: String,
      default: "",
    },
    atsScoreBefore: {
      type: Number,
      default: 0,
    },
    atsScoreAfter: {
      type: Number,
      default: 0,
    },
    diff: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
