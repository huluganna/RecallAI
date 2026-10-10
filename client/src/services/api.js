const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export async function generateQuestionsFromAI(topic, notes) {
  const response = await fetch(
    `${API_BASE_URL}/api/generate-questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, notes }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate questions");
  }

  return await response.json();
}

export async function evaluateAnswerWithAI(
  question,
  answer,
  keyConcepts
) {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluate-answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer, keyConcepts }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to evaluate answer");
  }

  return await response.json();
}

export async function saveLearningSession(sessionData) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save learning session");
  }

  return await response.json();
}

export async function getLearningSessions() {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch learning sessions");
  }

  return await response.json();
}