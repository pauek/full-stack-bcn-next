"use server";

import { FormState } from "@/components/CheckAnswer";
import data from "@/lib/data";

const delay = async (ms: number) => new Promise((solve, _) => setTimeout(solve, ms));

export async function actionCheckAnswer(_prev: FormState, formData: FormData) {
  const hashData = formData.get("quizHash");
  if (!hashData) {
    return { error: true, message: "No such question!" };
  }
  const hash = hashData.valueOf() as string;
  const quizAnswers = await data.getQuizAnswerForHash(hash);
  if (quizAnswers.length === 0) {
    return { error: true, message: "ERROR: No answers found in DB!" };
  }
  const formAnswer = formData.get("answer");
  if (!formAnswer) {
    return { message: "No answer" };
  }
  const userAnswer = formAnswer?.valueOf() as string;
  const correct = quizAnswers.includes(userAnswer.trim());
  
  return { correct, message: correct ? "Correct!" : "Wrong" };
}
