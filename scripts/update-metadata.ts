import { courseUpdateMetadata, getPiece } from "@/lib/data/files";

const courseId = process.env.COURSE!;
const course = await getPiece([courseId]);
if (!course) {
  throw `Course "${courseId}" not found!`;
}

await courseUpdateMetadata(course);
