export async function generateQuestionsFromAI(topic, notes) {
  const response = await fetch(
    "http://localhost:5000/api/generate-questions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic,
        notes: notes,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate questions");
  }

  const data = await response.json();

  return data;
}

export async function evaluateAnswerWithAI(
  question,
  answer,
  keyConcepts
)
{
  const response = await fetch(
    "http://localhost:5000/api/evaluate-answer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        answer: answer,
        keyConcepts: keyConcepts,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to evaluate answer");
  }

  const data = await response.json();

  return data;
}

export async function saveLearningSession(sessionData) {
  const response = await fetch(
    "http://localhost:5000/api/sessions",
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
    "http://localhost:5000/api/sessions"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch learning sessions");
  }

  return await response.json();
}