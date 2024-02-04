import { ContentPiece } from "../adt";
import { COURSE_ID } from "../env";
import { DataBackend } from "./data-backend";

// Get the course (the root)
export const getRoot = async (backend: DataBackend): Promise<ContentPiece> => {
  const courseId = COURSE_ID;
  const course = await backend.getPiece([courseId]);
  if (!course) {
    throw `Course ${courseId} not found!`;
  }
  return course;
};
