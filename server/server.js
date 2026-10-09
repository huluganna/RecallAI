const {
  generateQuestions,
  evaluateAnswer,
} = require("./services/aiService");

const express = require("express");
const connectDB = require("./config/db");
const LearningSession = require("./models/LearningSession");
const cors = require("cors");
require("dotenv").config();


const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "RecallAI backend is running!"
  });
});



app.post("/api/generate-questions", async (req, res) => {
  const { topic, notes } = req.body;

  console.log("Topic:", topic);
  console.log("Notes:", notes);

  try {
    const questions = await generateQuestions(topic, notes);

    res.json({
      topic: topic,
      questions: questions,
    });
  } catch (error) {
    console.error("Error generating questions:", error);

    res.status(500).json({
      error: "Failed to generate questions",
    });
  }
});

app.post("/api/evaluate-answer", async (req, res) => {
  const { question, answer, keyConcepts } = req.body;

  console.log("Evaluating answer...");
  console.log("Question:", question);
  console.log("Answer:", answer);
  console.log("Key concepts:", keyConcepts);

  try {
    const evaluation = await evaluateAnswer(
      question,
      answer,
      keyConcepts
    );

    res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating answer:", error);

    res.status(500).json({
      error: "Failed to evaluate answer",
    });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const session = new LearningSession(req.body);

    const savedSession = await session.save();

    res.status(201).json(savedSession);
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Failed to save session" });
  }
});

app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await LearningSession.find()
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});