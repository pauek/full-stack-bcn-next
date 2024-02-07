import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { showExecutionTime } from "@/lib/utils";

export const generateStaticParamsCommon = (kind: string) => async () => {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await data.getPiece([env.COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await data.getAllIdpaths(course.idpath);
  }, kind);

  return idpaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
};
