import {
  getPieceSlideList,
  getPieceWithChildren,
  pieceHasDoc,
  pieceNumSlides,
} from "@/lib/files/files";
import { notFound } from "next/navigation";
import ChapterDocument from "./ChapterDocument";
import SlideGrid from "./ChapterSlideGrid";
import StaticLayout from "./StaticLayout";
import ChapterContent from "./ChapterContent";

export default async function ChapterPageBody({ idpath }: { idpath: string[] }) {
  const chapter = await getPieceWithChildren(idpath);
  if (chapter === null) {
    notFound();
  }

  const slides = await getPieceSlideList(chapter);

  let options = [];
  if (await pieceHasDoc(chapter)) {
    options.push({
      name: "Document",
      component: <ChapterDocument path={idpath} />,
    });
  }
  if ((await pieceNumSlides(chapter)) > 0) {
    options.push({
      name: "Slides",
      component: <SlideGrid path={idpath} slides={slides} />,
    });
  }

  return (
    <StaticLayout path={idpath}>
      <ChapterContent chapter={chapter} options={options} />
    </StaticLayout>
  );
}
