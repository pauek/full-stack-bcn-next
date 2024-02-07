import ChapterItem from "@/components/ChapterItem";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { pieceUrl } from "@/lib/urls";
import { showExecutionTime } from "@/lib/utils";
import { redirect } from "next/navigation";

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
    return (
      <div className="text-red-500">
        Session with path <code>{idpath.join("/")}</code> not found
      </div>
    );
  }

  redirect(`${pieceUrl(idpath)}/doc`);

  // return (
  //   <div className="md:max-w-[54em] m-auto py-4 pt-4 border rounded-lg bg-background">
  //     <div className="flex flex-col gap-4 mx-5">
  //       {piece.children?.map((piece, index) => (
  //         <ChapterItem key={piece.id} index={index + 1} chapter={piece} />
  //       ))}
  //     </div>
  //   </div>
  // );
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
