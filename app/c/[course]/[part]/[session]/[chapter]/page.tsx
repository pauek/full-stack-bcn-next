import ChapterPageBody from "@/components/ChapterPageBody";

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

// export async function generateStaticParams() {
//   console.log("chapter::generateStaticParams");
//   const course = await data.getPiece([process.env.COURSE_ID!]);
//   if (!course) {
//     return [];
//   }
//   const idpaths = await data.getAllIdpaths(course.idpath);
//   return idpaths
//     .filter((path) => path.length === 4)
//     .map(([course, part, session, chapter]) => ({ course, part, session, chapter }));
// }
