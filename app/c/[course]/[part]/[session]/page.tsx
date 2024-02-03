import SessionPageBody from "@/components/SessionPageBody";
import { cachedGetAllIdpaths, cachedGetPiece } from "@/lib/data/cached";
import Loading from "./loading";
import { delay, showExecutionTime } from "@/lib/utils";

type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export default async function Page({ params }: _Props) {
  await delay(1000);
  const { course, part, session } = params;
  const idpath = [course, part, session];
  return <SessionPageBody idpath={idpath} />;
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await cachedGetPiece([process.env.COURSE_ID!]);
    if (!course) {
      return [];
    }
    idpaths = await cachedGetAllIdpaths(course);
  }, "sessions");

  return idpaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
}
