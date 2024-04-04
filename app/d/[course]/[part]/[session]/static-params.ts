import data from "@/lib/data";
import { env } from "@/lib/env.mjs";

export const generateStaticParamsCommon = async () => {
  const course = await data.getPiece([env.COURSE_ID]);
  if (!course) {
    return [];
  }
  return (await data.getAllIdpaths(course.idpath))
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
};
