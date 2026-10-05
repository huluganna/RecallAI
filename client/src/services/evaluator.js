export function evaluateAnswer(answer, currentQuestion) {
  const userAnswer = answer.toLowerCase();

  let matchedKeywords = 0;

  currentQuestion.expectedKeywords.forEach((keyword) => {
    if (userAnswer.includes(keyword)) {
      matchedKeywords++;
    }
  });

  const score = Math.round(
    (matchedKeywords / currentQuestion.expectedKeywords.length) * 10
  );

  return {
    score: score,
    matchedKeywords: matchedKeywords,
  };
}