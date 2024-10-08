import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { splitMarkdownPreamble } from "@/lib/utils"
import { readFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { getDiskpathByIdpath } from "./hashmaps"
import { getDiskpathForPiece, listPieceSubdir } from "./utils"

export const getQuizPartsFromFile = (text: string) => {
  const { preamble, body } = splitMarkdownPreamble(text)
  if (!preamble) {
    throw new Error("Question missing preamble")
  }
  const { answers }: { answers: string[] } = JSON.parse(preamble)
  if (!answers) {
    throw new Error("Question missing answer")
  }
  if (!Array.isArray(answers)) {
    throw new Error("Answer should be an array!")
  }
  return { answers, body }
}

export const collectAnswersForPiece = async (piece: ContentPiece): Promise<Map<Hash, string[]>> => {
  const diskpath = await getDiskpathForPiece(piece)
  const quizList = await listPieceSubdir(diskpath, FileType.quiz)
  const quizAnswers = new Map<Hash, string[]>()
  for (const quiz of quizList) {
    const content = await readFile(join(diskpath, "quiz", quiz.filename))
    const { answers } = getQuizPartsFromFile(content.toString())
    quizAnswers.set(quiz.hash, answers)
  }
  return quizAnswers
}

export const getQuizAnswersForHash = async (idpath: string[], hash: Hash): Promise<string[]> => {
  const diskpath = await getDiskpathByIdpath(idpath)
  if (diskpath === null) {
    throw new Error(`No diskpath found for hash ${hash}`)
  }
  const quizList = await listPieceSubdir(diskpath, FileType.quiz)
  const chosenQuiz = quizList.find((quiz) => quiz.hash === hash)
  if (chosenQuiz === undefined) {
    console.warn(`Warning: no quiz found for hash ${hash}`)
    return []
  }
  const content = await readFile(join(diskpath, "quiz", chosenQuiz.filename))
  const { answers } = getQuizPartsFromFile(content.toString())
  return answers
}
