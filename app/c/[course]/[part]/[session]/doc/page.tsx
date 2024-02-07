import ChapterDocument from "@/components/ChapterDocument";
import data from "@/lib/data";
import { notFound } from "next/navigation";
import "./.meta.json";

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
  return piece.children?.map((chapter) => (
    <div>
      <h2>{chapter.name}</h2>
      <ChapterDocument key={chapter.hash} chapter={chapter} />
    </div>
  ));
}
