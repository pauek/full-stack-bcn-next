import data from "@/lib/data";
import { notFound } from "next/navigation";
import ChapterContent from "./ChapterContent";
import ChapterDocument from "./ChapterDocument";
import SlideGrid from "./ChapterSlideGrid";

export default async function ChapterPageBody({ idpath }: { idpath: string[] }) {
  const chapter = await data.getPieceWithChildren(idpath);
  if (chapter === null) {
    notFound();
  }

  const slides = await data.getPieceSlideList(chapter);

  let options = [];
  if (chapter.metadata.hasDoc) {
    options.push({
      name: "Document",
      component: <ChapterDocument chapter={chapter} />,
    });
  }
  if (chapter.metadata.numSlides > 0) {
    options.push({
      name: "Slides",
      component: <SlideGrid path={idpath} slides={slides} />,
    });
  }

  return <ChapterContent chapter={chapter} options={options} />;
}
