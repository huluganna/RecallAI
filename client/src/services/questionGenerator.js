export function generateQuestions(topic,notes) {
  const questions = [
    {
      question: `What is the main purpose of ${topic}?`,
      expectedKeywords: ["evaluate", "performance", "model", "prediction"],
    },
    {
      question: `Why is ${topic} important in machine learning?`,
      expectedKeywords: ["model", "performance", "evaluation"],
    },
    {
      question: `Give one example related to ${topic}.`,
      expectedKeywords: ["example"],
    },
    {
      question: `What is one limitation of ${topic}?`,
      expectedKeywords: ["limitation"],
    },
    {
      question: `How would you explain ${topic} to a beginner?`,
      expectedKeywords: ["explain", "simple"],
    },
  ];

  return questions;
}