const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  keyConcepts: {
    type: [String],
    default: [],
  },

  answer: {
    type: String,
    default: "",
  },

  score: {
    type: Number,
    default: null,
  },

  feedback: {
    type: String,
    default: "",
  },

  missingConcepts: {
    type: [String],
    default: [],
  },
});

const learningSessionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      required: true,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LearningSession", learningSessionSchema);