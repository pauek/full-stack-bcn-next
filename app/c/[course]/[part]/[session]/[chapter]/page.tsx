import ChapterPageBody from "@/components/ChapterPageBody";
import { env } from "@/lib/env.mjs";
import data from "@/lib/data";
import { showExecutionTime } from "@/lib/utils";

type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
    chapter: string;
  };
};

export default async function Page({ params }: _Props) {
  const { course, part, session, chapter } = params;
  return (
    <>
      {/* <div className="absolute top-[2.2em] left-0 right-0 bottom-0 z-50">
        <div className="w-full pt-3">
          <Loading />
        </div>
      </div> */}
      <ChapterPageBody idpath={[course, part, session, chapter]} />
    </>
  );
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await data.getPiece([env.COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await data.getAllIdpaths(course.idpath);
  }, "chapters");

  return idpaths
    .filter((path) => path.length === 4)
    .map(([course, part, session, chapter]) => ({ course, part, session, chapter }));
}
