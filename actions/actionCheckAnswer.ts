"use server";

import { FormState } from "@/components/CheckAnswer";
import data from "@/lib/data";

export async function actionCheckAnswer(_prev: FormState, formData: FormData) {
  const hashData = formData.get("quizHash");
  if (!hashData) {
    return { error: true, message: "No such question!" };
  }
  const hash = hashData.valueOf() as string;
  const quizAnswer = await data.getQuizAnswerForHash(hash);
  if (!quizAnswer) {
    return { error: true, message: "ERROR: Answer not found in DB!" };
  }
  const formAnswer = formData.get("answer");
  if (!formAnswer) {
    return { message: "No answer" };
  }
  const userAnswer = formAnswer?.valueOf() as string;
  const correct = userAnswer.trim() === quizAnswer.trim();
  return { correct, message: correct ? "Correct!" : "Wrong" };
}
