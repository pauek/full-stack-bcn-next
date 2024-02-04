import SessionPageBody from "@/components/SessionPageBody";
import { env } from "@/lib/env.mjs";
import data from "@/lib/data";
import { showExecutionTime } from "@/lib/utils";

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
  return <SessionPageBody idpath={idpath} />;
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  showExecutionTime(async () => {
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
