import { FileType } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { env } from "@/lib/env.mjs";
import { getQuizPartsFromFile } from "@/lib/utils";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Hash } from "../hashing";
import { listPieceSubdir } from "./utils";

const ANSWERS_FILE = join(env.CONTENT_ROOT, "./answers.json");

export const writeAnswers = async (answers: Map<Hash, string[]>) => {
  const json = JSON.stringify([...answers.entries()]);
  await writeFile(ANSWERS_FILE, json);
};

export const readAnswers = async (): Promise<Map<Hash, string[]>> => {
  const content = await readFile(ANSWERS_FILE);
  const entries = JSON.parse(content.toString());
  return new Map(entries);
};

export const collectAnswersForPiece = async (piece: ContentPiece): Promise<Map<Hash, string[]>> => {
  const quizList = await listPieceSubdir(piece.diskpath, FileType.quiz);
  const quizAnswers = new Map<Hash, string[]>();
  for (const quiz of quizList) {
    const content = await readFile(join(piece.diskpath, "quiz", quiz.filename));
    const { answers } = getQuizPartsFromFile(content.toString());
    quizAnswers.set(quiz.hash, answers);
  }
  return quizAnswers;
};
