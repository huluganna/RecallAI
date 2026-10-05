import { generateQuestionsFromAI, evaluateAnswerWithAI } from "./services/api";
import { useState } from "react";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [topics, setTopics] = useState([]);

  const [quiz, setQuiz] = useState(null);
const [answer, setAnswer] = useState("");
const [submitted, setSubmitted] = useState(false);
const [results, setResults] = useState([]);


  function saveTopic() {
    if (topic.trim() === "" || notes.trim() === "") {
      alert("Please enter both topic and notes.");
      return;
    }

    const newTopic = {
      id: Date.now(),
      topic: topic,
      notes: notes,
    };

    setTopics([...topics, newTopic]);

    setTopic("");
    setNotes("");
    setShowForm(false);
  }
async function startQuiz(item) {
  try {
    const data = await generateQuestionsFromAI(
      item.topic,
      item.notes
    );

    console.log("AI QUIZ DATA:", data);
    console.log("AI QUESTIONS:", data.questions);

    setQuiz({
      topic: data.topic,
      questions: data.questions,
      currentQuestion: 0,
    });

    setAnswer("");
    setSubmitted(false);
    setResults([]);
  } catch (error) {
    console.error("Error generating questions:", error);
    alert("Failed to generate questions.");
  }
}

function nextQuestion() {
  setQuiz({
    ...quiz,
    currentQuestion: quiz.currentQuestion + 1,
  });

  setAnswer("");
  setSubmitted(false);

}

async function submitAnswer() {
  if (answer.trim() === "") {
    alert("Please enter an answer.");
    return;
  }

  const currentQuestion =
    quiz.questions[quiz.currentQuestion];

  console.log("CURRENT QUESTION:", currentQuestion);

  if (!currentQuestion.keyConcepts) {
    console.error(
      "keyConcepts is missing:",
      currentQuestion
    );

    alert("Question data is missing key concepts.");
    return;
  }

  try {
    const evaluation = await evaluateAnswerWithAI(
      currentQuestion.question,
      answer,
      currentQuestion.keyConcepts
    );

    console.log("AI EVALUATION:", evaluation);

    const score = evaluation.score;

    setSubmitted({
      score: score,
      feedback: evaluation.feedback,
      missingConcepts: evaluation.missingConcepts,
    });

    setResults((prevResults) => {
      const updatedResults = prevResults.filter(
        (result) =>
          result.questionIndex !== quiz.currentQuestion
      );

      return [
        ...updatedResults,
        {
          questionIndex: quiz.currentQuestion,
          score: score,
          feedback: evaluation.feedback,
          missingConcepts: evaluation.missingConcepts,
        },
      ];
    });

  } catch (error) {
    console.error("Error evaluating answer:", error);
    alert("Failed to evaluate answer. Please try again.");
  }
}

function calculateFinalScore() {
  if (results.length === 0) {
    return 0;
  }

  const totalScore = results.reduce(
    (total, result) => total + result.score,
    0
  );

  return (totalScore / results.length).toFixed(1);
}

function getWeakQuestions() {
  return results.filter((result) => result.score < 5);
}

function getRevisionMessage() {
  const score = Number(calculateFinalScore());

  if (score >= 8) {
    return "🟢 Strong recall! You are retaining this topic well. Try revising it again later to reinforce your memory.";
  }

  if (score >= 5) {
    return "🟡 Moderate recall. Some concepts need reinforcement. Review your notes and try the quiz again.";
  }

  return "🔴 This topic needs more revision. Review your notes carefully and retry the quiz.";
}

  return (
    <div>
      <h1>RecallAI</h1>
      <p>Learn. Recall. Remember.</p>

      <button onClick={testBackend}>
  Test Backend
</button>

      <button onClick={() => setShowForm(true)}>
        + Add New Topic
      </button>

      {showForm && (
        <div>
          <h2>Add New Topic</h2>

          <input
            type="text"
            placeholder="Topic name"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <br />

          <textarea
            placeholder="What did you learn?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <br />

          <button onClick={saveTopic}>Save Topic</button>

          <button onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}

      <h2>Your Topics</h2>

      {topics.map((item) => (
  <div key={item.id}>
    <h3>{item.topic}</h3>
    <p>{item.notes}</p>

    <button onClick={() => startQuiz(item)}>
      Generate Questions
    </button>
  </div>
))}

{quiz && (
  <div>
    <h2>Quiz</h2>

    <h3>{quiz.topic}</h3>

   <p>
  Question {quiz.currentQuestion + 1} of {quiz.questions.length}
</p>

<h3>
  {quiz.questions[quiz.currentQuestion].question}
</h3>

    <textarea
      placeholder="Write your answer..."
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
    />

    <br />

    <button onClick={submitAnswer}>
      Submit Answer
    </button>

   {submitted && quiz.currentQuestion < quiz.questions.length - 1 && (
  <button onClick={nextQuestion}>
    Next Question
  </button>
)}

{submitted && quiz.currentQuestion === quiz.questions.length - 1 && (
  <h2>🎉 Quiz Completed!</h2>
)}

{submitted && (
  <div>
    <h3>🤖 AI Evaluation</h3>

    <p>
      <strong>Score:</strong> {submitted.score}/10
    </p>

    <p>
      <strong>Feedback:</strong> {submitted.feedback}
    </p>

    <h4>🧠 Concepts to Improve</h4>

    {submitted.missingConcepts &&
    submitted.missingConcepts.length > 0 ? (
      <ul>
        {submitted.missingConcepts.map((concept, index) => (
          <li key={index}>{concept}</li>
        ))}
      </ul>
    ) : (
      <p>🟢 No major concepts were missed!</p>
    )}
  </div>
)}
<h3>Stored Results</h3>

{results.map((result) => (
  <p key={result.questionIndex}>
    Question {result.questionIndex + 1}: {result.score}/10
  </p>
))}
{submitted &&
 quiz.currentQuestion === quiz.questions.length - 1 && (
  <div>
    <h3>🎯 Overall Score</h3>

    <p>
      {calculateFinalScore()} / 10
    </p>
      <h3>🧠 Weak Areas</h3>

      {getWeakQuestions().length === 0 ? (
        <p>🟢 No major weak areas detected!</p>
      ) : (
        getWeakQuestions().map((result) => (
          <p key={result.questionIndex}>
            Question {result.questionIndex + 1} → {result.score}/10
          </p>
        ))
      )}
      <h3>💡 Revision Recommendation</h3>

<p>
  {getRevisionMessage()}
</p>  

  </div>
)}

  </div>
)}
    </div>
  );
}

async function testBackend() {
  try {
    const response = await fetch("http://localhost:5000/api/test");

    const data = await response.json();

    alert(data.message);
  } catch (error) {
    console.error("Error connecting to backend:", error);
  }
}

export default App;