import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { pieceUrl } from "@/lib/urls";
import { showExecutionTime } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export default async function Page({ params }: _Props) {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const piece = await data.getPieceWithChildren(idpath);
  if (piece === null) {
    notFound();
  }
  redirect(`${pieceUrl(idpath)}/doc`);
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await data.getPiece([env.COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await data.getAllIdpaths(course.idpath);
  }, "sessions");

  return idpaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
}
