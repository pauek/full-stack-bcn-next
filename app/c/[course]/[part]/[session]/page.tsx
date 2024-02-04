import SessionPageBody from "@/components/SessionPageBody";

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

// export async function generateStaticParams() {
//   console.log("session::generateStaticParams")
//   const course = await data.getPiece([process.env.COURSE_ID!]);
//   if (!course) {
//     return [];
//   }
//   const idpaths = await data.getAllIdpaths(course.idpath);
//   return idpaths
//     .filter((path) => path.length === 3)
//     .map(([course, part, session]) => ({ course, part, session }));
// }
