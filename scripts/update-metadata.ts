import { courseUpdateMetadata, getPiece } from "@/lib/data/files";
import { backend as files } from "@/lib/data/files";

const courseId = process.env.COURSE_ID!;
const course = await getPiece([courseId]);
if (!course) {
  throw `Course "${courseId}" not found!`;
}

await courseUpdateMetadata(files, course);
