import { ContentPiece } from "../adt";
import { env } from "@/lib/env.mjs";
import { DataBackend } from "./data-backend";

// Get the course (the root)
export const getRoot = async (backend: DataBackend): Promise<ContentPiece> => {
  const rootId = env.COURSE_ID;
  const course = await backend.getPiece([rootId]);
  if (!course) {
    throw `Course "${rootId}" not found!`;
  }
  return course;
};

