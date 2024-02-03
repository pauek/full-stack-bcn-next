import ChapterPageBody from "@/components/ChapterPageBody";
import { cachedGetAllIdpaths, cachedGetPiece } from "@/lib/data/cached";

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
  const course = await cachedGetPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const idpaths = await cachedGetAllIdpaths(course);
  return idpaths.map((idpath) => ({ idpath }));
}
