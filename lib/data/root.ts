import { ContentPiece } from "../adt";
import data from "@/lib/data";

// Get the course (the root)
export const getCourseRoot = async (): Promise<ContentPiece> => {
  const courseId = process.env.COURSE_ID!;
  const course = await data.getPiece([courseId]);
  if (!course) {
    throw `Course ${courseId} not found!`;
  }
  return course;
};
