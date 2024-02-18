"use server";

import data from "@/lib/data";

export async function actionCheckAnswer(prevState: any, formData: FormData) {
  const hashData = formData.get("quizHash");
  if (!hashData) {
    return { message: "No quiz hash" };
  }
  const hash = hashData.valueOf() as string;
  const quizAnswer = await data.getQuizAnswerForHash(hash);
  if (!quizAnswer) {
    return { message: "No answer" };
  }
  const formAnswer = formData.get("answer");
  if (!formAnswer) {
    return { message: "No answer" };
  }
  const userAnswer = formAnswer?.valueOf();
  return { message: userAnswer === quizAnswer ? "Correct!" : "Wrong" };
}
