async function generateQuestions(topic, notes) {
  const response = await fetch(
    "https://app.backboard.io/api/threads/messages",
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.BACKBOARD_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `
You are an AI learning assistant.

Generate exactly 5 useful quiz questions using ONLY information explicitly present in the student's notes.

STRICT RULES:
- Do not invent facts.
- Do not assume what an abbreviation, acronym, or unfamiliar term means.
- Do not use outside knowledge to create questions.
- Every question must be answerable from the provided notes.
- If the notes contain very little information, create simpler questions from the available information rather than inventing additional context.
- The topic name is only used to identify the subject; the notes are the source of truth.

Topic:
${topic}

Notes:
${notes}

Return ONLY valid JSON in this format:

{
  "questions": [
    {
      "question": "question text",
      "keyConcepts": ["concept1", "concept2"]
    }
  ]
}

Make the questions different in difficulty and test understanding, not memorization.
`,
        json_output: true,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backboard error:", errorText);
    throw new Error("Backboard API request failed");
  }

  const data = await response.json();

  console.log("Backboard response:", data);

  const result = JSON.parse(data.content);

  const questions = result.questions.map((q) => ({
    question: q.question,
    keyConcepts: q.keyConcepts || q.expectedKeywords || [],
  }));

  console.log("Generated questions:", questions);

  return questions;
}
async function evaluateAnswer(question, answer, keyConcepts) {
  const response = await fetch(
    "https://app.backboard.io/api/threads/messages",
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.BACKBOARD_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `
You are an AI learning evaluator.

Evaluate the student's answer based on the question and key concepts.

Question:
${question}

Key concepts:
${keyConcepts.join(", ")}

Student answer:
${answer}

Return ONLY valid JSON in this format:

{
  "score": 0,
  "feedback": "brief constructive feedback",
  "missingConcepts": ["concepts the student missed"]
}

Score the answer from 0 to 10.

Do not require the student to use the exact wording of the key concepts.
Evaluate whether the student demonstrates the underlying understanding.
`,
        json_output: true,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backboard evaluation error:", errorText);
    throw new Error("Backboard evaluation failed");
  }

  const data = await response.json();

  console.log("Evaluation response:", data);

  return JSON.parse(data.content);
}

module.exports = {
  generateQuestions,
  evaluateAnswer,
};