
import {
  generateQuestionsFromAI,
  evaluateAnswerWithAI,
  saveLearningSession,
  getLearningSessions,
} from "./services/api";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [topics, setTopics] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [learningHistory, setLearningHistory] = useState([]);

  useEffect(() => {
    async function loadLearningHistory() {
      try {
        const sessions = await getLearningSessions();
        setLearningHistory(sessions);
      } catch (error) {
        console.error("Error loading learning history:", error);
      }
    }

    loadLearningHistory();
  }, []);

  function saveTopic() {
    if (topic.trim() === "" || notes.trim() === "") {
      alert("Please enter both topic and notes.");
      return;
    }

    setTopics((previous) => [
      ...previous,
      { id: Date.now(), topic: topic.trim(), notes: notes.trim() },
    ]);

    setTopic("");
    setNotes("");
    setShowForm(false);
  }

  async function startQuiz(item) {
    try {
      const data = await generateQuestionsFromAI(item.topic, item.notes);

      setQuiz({
        topic: data.topic,
        notes: item.notes,
        questions: data.questions,
        currentQuestion: 0,
      });

      setAnswer("");
      setSubmitted(false);
      setResults([]);
      setSessionSaved(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions.");
    }
  }

  function nextQuestion() {
    setQuiz((previous) => ({
      ...previous,
      currentQuestion: previous.currentQuestion + 1,
    }));

    setAnswer("");
    setSubmitted(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      alert("Please enter an answer.");
      return;
    }

    const currentQuestion = quiz.questions[quiz.currentQuestion];

    if (!currentQuestion.keyConcepts) {
      alert("Question data is missing key concepts.");
      return;
    }

    try {
      const evaluation = await evaluateAnswerWithAI(
        currentQuestion.question,
        answer,
        currentQuestion.keyConcepts
      );

      setSubmitted({
        score: evaluation.score,
        feedback: evaluation.feedback,
        missingConcepts: evaluation.missingConcepts,
      });

      setResults((previous) => {
        const updated = previous.filter(
          (result) => result.questionIndex !== quiz.currentQuestion
        );

        return [
          ...updated,
          {
            questionIndex: quiz.currentQuestion,
            question: currentQuestion.question,
            keyConcepts: currentQuestion.keyConcepts,
            answer,
            score: evaluation.score,
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
    if (results.length === 0) return 0;

    const total = results.reduce((sum, result) => sum + result.score, 0);
    return (total / results.length).toFixed(1);
  }

  async function saveSession() {
    try {
      const sessionData = {
        topic: quiz.topic,
        notes: quiz.notes,
        questions: [...results]
          .sort((a, b) => a.questionIndex - b.questionIndex)
          .map((result) => ({
            question: result.question,
            keyConcepts: result.keyConcepts,
            answer: result.answer,
            score: result.score,
            feedback: result.feedback,
            missingConcepts: result.missingConcepts,
          })),
        overallScore: Number(calculateFinalScore()),
      };

      const savedSession = await saveLearningSession(sessionData);
      setLearningHistory((previous) => [savedSession, ...previous]);
      console.log("SESSION SAVED:", savedSession);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save learning session.");
    }
  }

  useEffect(() => {
    if (
      quiz &&
      results.length === quiz.questions.length &&
      !sessionSaved
    ) {
      setSessionSaved(true);
      saveSession();
    }
  }, [results, quiz, sessionSaved]);

  function getWeakQuestions() {
    return results.filter((result) => result.score < 5);
  }

  function getRevisionMessage() {
    const score = Number(calculateFinalScore());

    if (score >= 8) {
      return "Strong recall! Revise this topic later to reinforce your memory.";
    }

    if (score >= 5) {
      return "Some concepts need reinforcement. Review your notes and try again.";
    }

    return "This topic needs more revision. Review your notes carefully and retry.";
  }

  const totalSessions = learningHistory.length;

  const averageScore =
    totalSessions > 0
      ? (
          learningHistory.reduce(
            (sum, session) => sum + (Number(session.overallScore) || 0),
            0
          ) / totalSessions
        ).toFixed(1)
      : "—";

  const latestSession =
    learningHistory.length > 0
      ? [...learningHistory].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
      : null;

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          Recall<span>AI</span>
        </div>

        <div>
          <p className="sidebar-label">Workspace</p>

          <nav className="sidebar-nav">
            <button
              className="nav-item active"
              onClick={() => scrollToSection("overview")}
            >
              ◫ &nbsp; Overview
            </button>

            <button
              className="nav-item"
              onClick={() => scrollToSection("topics")}
            >
              ▤ &nbsp; My Topics
            </button>

            <button
              className="nav-item"
              onClick={() => scrollToSection("history")}
            >
              ◷ &nbsp; Learning History
            </button>
          </nav>
        </div>

        <div className="sidebar-note">
          <strong>Small steps, lasting memory.</strong>
          <br />
          Keep learning, practise recall, and revisit what matters.
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Your learning space</p>
            <h1 className="page-title">Welcome to RecallAI 👋</h1>
            <p className="page-subtitle">
              Learn actively. Strengthen your recall. Remember more.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              setShowForm(true);
              scrollToSection("topics");
            }}
          >
            + Add New Topic
          </button>
        </header>

        <section id="overview" className="page-section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Learning Overview</h2>
              <p className="section-description">
                A snapshot of your learning journey.
              </p>
            </div>
          </div>

          <div className="dashboard-grid">
            <article className="stat-card">
              <p className="stat-label">Total Sessions</p>
              <div className="stat-value">{totalSessions}</div>
              <p className="stat-caption">Saved learning sessions</p>
            </article>

            <article className="stat-card">
              <p className="stat-label">Average Score</p>
              <div className="stat-value">
                {averageScore}
                {averageScore !== "—" && (
                  <span style={{ fontSize: 15, color: "#858ba3" }}>
                    {" "}/ 10
                  </span>
                )}
              </div>
              <p className="stat-caption">Across saved sessions</p>
            </article>

            <article className="stat-card">
              <p className="stat-label">Latest Score</p>
              <div className="stat-value">
                {latestSession ? latestSession.overallScore : "—"}
                {latestSession && (
                  <span style={{ fontSize: 15, color: "#858ba3" }}>
                    {" "}/ 10
                  </span>
                )}
              </div>
              <p className="stat-caption">
                {latestSession
                  ? latestSession.topic
                  : "Complete a quiz to get started"}
              </p>
            </article>
          </div>
        </section>

        <section id="topics" className="page-section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Your Topics</h2>
              <p className="section-description">
                Turn your notes into active-recall practice.
              </p>
            </div>
          </div>

          {showForm && (
            <form
              className="form-panel"
              onSubmit={(event) => {
                event.preventDefault();
                saveTopic();
              }}
            >
              <h2 className="section-title">Add a learning topic</h2>

              <label htmlFor="topic-name">Topic name</label>
              <input
                id="topic-name"
                type="text"
                placeholder="e.g. Linear Regression"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />

              <label htmlFor="topic-notes">Your notes</label>
              <textarea
                id="topic-notes"
                rows={5}
                placeholder="Write or paste what you learned..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />

              <div className="card-actions">
                <button className="primary-button" type="submit">
                  Save Topic
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {topics.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 30, marginBottom: 10 }}>📚</div>
              <strong>No topics added in this session yet</strong>
              <p>
                Add a topic and your notes to generate an AI-powered quiz.
              </p>
              <button
                className="secondary-button"
                onClick={() => setShowForm(true)}
              >
                + Create your first topic
              </button>
            </div>
          ) : (
            <div className="topic-grid">
              {topics.map((item) => (
                <article className="topic-card" key={item.id}>
                  <div className="card-topline">
                    <span className="card-icon">✦</span>
                    <span className="score-badge">Ready to practise</span>
                  </div>

                  <h3 className="topic-title">{item.topic}</h3>
                  <p className="topic-description">{item.notes}</p>

                  <div className="card-actions">
                    <button
                      className="primary-button"
                      onClick={() => startQuiz(item)}
                    >
                      Generate Questions →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="history" className="page-section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Learning History</h2>
              <p className="section-description">
                Review your previous sessions and scores.
              </p>
            </div>
          </div>

          {learningHistory.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 28, marginBottom: 8 }}>◷</div>
              <strong>Your learning journey starts here</strong>
              <p>Complete a quiz to see your saved sessions here.</p>
            </div>
          ) : (
            <div className="history-grid">
              {learningHistory.map((session) => (
                <article className="history-card" key={session._id}>
                  <div className="card-topline">
                    <span className="card-icon">📖</span>
                    <span className="score-badge">
                      {Number(session.overallScore).toFixed(1)}/10
                    </span>
                  </div>

                  <h3 className="topic-title">{session.topic}</h3>

                  <div className="history-meta">
                    <span>
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </span>
                    <span>
                      {session.questions?.length ?? 0} questions
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {quiz && (
          <section className="page-section quiz-panel" id="quiz">
            <p className="eyebrow">Active learning session</p>
            <h2 className="section-title">{quiz.topic}</h2>

            <p className="section-description">
              Question {quiz.currentQuestion + 1} of {quiz.questions.length}
            </p>

            <div className="quiz-progress">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${
                    ((quiz.currentQuestion + (submitted ? 1 : 0)) /
                      quiz.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <h3 className="quiz-question">
              {quiz.questions[quiz.currentQuestion].question}
            </h3>

            <textarea
              className="answer-input"
              placeholder="Explain your answer in your own words..."
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(submitted)}
            />

            <div className="card-actions">
              {!submitted && (
                <button className="primary-button" onClick={submitAnswer}>
                  Submit Answer
                </button>
              )}

              {submitted &&
                quiz.currentQuestion < quiz.questions.length - 1 && (
                  <button className="primary-button" onClick={nextQuestion}>
                    Next Question →
                  </button>
                )}
            </div>

            {submitted && (
              <div className="feedback-panel">
                <p className="eyebrow">AI evaluation</p>
                <h3 className="section-title">
                  Your score: {submitted.score}/10
                </h3>

                <p>{submitted.feedback}</p>

                <h4>Concepts to improve</h4>

                {submitted.missingConcepts?.length > 0 ? (
                  <ul className="concept-list">
                    {submitted.missingConcepts.map((concept, index) => (
                      <li key={index}>{concept}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="success-text">
                    ✓ No major concepts were missed!
                  </p>
                )}
              </div>
            )}

            <div className="page-section" style={{ marginTop: 26 }}>
              <h3 className="section-title">Answer Results</h3>

              {results.length === 0 ? (
                <p className="section-description">
                  Your evaluated answers will appear here.
                </p>
              ) : (
                <div className="results-list">
                  {results.map((result) => (
                    <div className="result-row" key={result.questionIndex}>
                      <span>Question {result.questionIndex + 1}</span>
                      <span>{result.score}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitted &&
              quiz.currentQuestion === quiz.questions.length - 1 && (
                <div className="feedback-panel">
                  <h2 className="section-title">🎉 Quiz Completed!</h2>

                  <p className="section-description">
                    Overall Score
                  </p>
                  <div className="stat-value">
                    {calculateFinalScore()}/10
                  </div>

                  <h3 className="section-title">Weak Areas</h3>

                  {getWeakQuestions().length === 0 ? (
                    <p className="success-text">
                      No low-scoring answers detected in this quiz.
                    </p>
                  ) : (
                    <ul className="concept-list">
                      {getWeakQuestions().map((result) => (
                        <li key={result.questionIndex}>
                          Question {result.questionIndex + 1}: {result.score}/10
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="revision-panel">
                    <strong>Revision recommendation</strong>
                    <p style={{ marginBottom: 0 }}>{getRevisionMessage()}</p>
                  </div>
                </div>
              )}
          </section>
        )}

        <footer
          style={{
            padding: "24px 0",
            borderTop: "1px solid var(--border)",
            color: "var(--muted)",
            fontSize: 12,
          }}
        >
          RecallAI · Learn. Recall. Remember.
        </footer>
      </main>
    </div>
  );
}

export default App;
