import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { env } from "@/lib/env.mjs"
import { getQuizPartsFromFile } from "@/lib/utils"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { getDiskpathForPiece, listPieceSubdir } from "./utils"

const ANSWERS_FILE = join(env.CONTENT_ROOT, "./answers.json")

export const writeAnswers = async (answers: Map<Hash, string[]>) => {
  const json = JSON.stringify([...answers.entries()], null, 2)
  await writeFile(ANSWERS_FILE, json)
}

export const readAnswers = async (): Promise<Map<Hash, string[]>> => {
  const content = await readFile(ANSWERS_FILE)
  const entries = JSON.parse(content.toString())
  return new Map(entries)
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

export const getQuizAnswersForHash = async (hash: Hash): Promise<string[]> => {
  const answers = await readAnswers()
  return answers.get(hash) || []
}
