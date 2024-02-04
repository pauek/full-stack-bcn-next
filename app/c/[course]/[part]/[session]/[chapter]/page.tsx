import ChapterPageBody from "@/components/ChapterPageBody";
import { cachedGetAllIdpaths, cachedGetPiece } from "@/lib/data/cached";
import { COURSE_ID } from "@/lib/env";
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
  const idpath = [course, part, session, chapter];

  return (
    <>
      {/* <div className="absolute top-[2.2em] left-0 right-0 bottom-0 z-50">
        <div className="w-full pt-3">
          <Loading />
        </div>
      </div> */}
      <ChapterPageBody idpath={idpath} />
    </>
  );
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await cachedGetPiece([COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await cachedGetAllIdpaths(course);
  }, "chapters");

  return idpaths.map(([course, part, session, chapter]) => ({ course, part, session, chapter }));
}
