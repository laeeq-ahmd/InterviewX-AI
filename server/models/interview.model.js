import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  questionType: {
    type: String,
    enum: ["behavioral", "project", "technical"],
    default: "behavioral"
  },
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
  technicalKnowledge: { type: Number, default: 0 },
  problemSolving: { type: Number, default: 0 },
})

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ["HR", "Technical"],
    required: true
  },
  resumeText: {
    type: String
  },
  resumeChunks: [{
    section: String,
    content: String
  }],
  questions: [questionsSchema],

  conversationHistory: [
    {
      role: { type: String, enum: ["system", "user", "assistant"] },
      content: String
    }
  ],

  finalScore: { type: Number, default: 0 },

  recommendation: {
    readinessLevel: { type: String, default: "" },
    studyTopics: { type: [String], default: [] },
    dsaTopics: { type: [String], default: [] }
  },

  status: {
    type: String,
    enum: ["Incompleted", "completed"],
    default: "Incompleted",
  }
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview