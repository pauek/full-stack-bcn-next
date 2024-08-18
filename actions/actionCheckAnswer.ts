"use server"

import { FormState } from "@/components/CheckAnswer"
import data from "@/lib/data"

const delay = async (ms: number) => new Promise((solve, _) => setTimeout(solve, ms))

export async function actionCheckAnswer(_prev: FormState, formData: FormData) {
  const hashData = formData.get("quizHash")
  if (!hashData) {
    return { error: true, message: "No such question!" }
  }
  const idjpathData = formData.get("idjpath")
  if (!idjpathData) {
    console.error("Missing chapter?")
    return { error: true, message: "Internal Error (Missing chapter?)" }
  }

  const hash = hashData.valueOf() as string
  const idjpath = idjpathData.valueOf() as string

  const idpath = idjpath.split("/")
  const quizAnswers = await data.getQuizAnswersForHash(idpath, hash)

  console.log(`Answers for ${hash} in ${idpath}: ${quizAnswers}`)

  if (quizAnswers.length === 0) {
    return { error: true, message: "ERROR: No answers found in DB!" }
  }
  const formAnswer = formData.get("answer")
  if (!formAnswer) {
    return { message: "No answer" }
  }
  const userAnswer = formAnswer?.valueOf() as string
  const correct = quizAnswers.includes(userAnswer.trim())

  return { correct, message: correct ? "Correct!" : "Wrong" }
}
