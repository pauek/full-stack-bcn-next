import { filesBackend } from "@/lib/data";
import { courseUpdateMetadata, getPiece } from "@/lib/data/files";

const courseId = process.env.COURSE_ID!;
const course = await getPiece([courseId]);
if (!course) {
  throw `Course "${courseId}" not found!`;
}
await courseUpdateMetadata(filesBackend, course, ({ idjpath, hasDoc, numSlides, index }) => {
  const _slides = numSlides > 0 ? `📊 ${numSlides}` : "";
  const _doc = hasDoc ? "📋" : "";
  console.log(`${idjpath} = [#${index}${_slides}${_doc}]`);
});
