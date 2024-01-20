import data from "@/lib/backend";
import { notFound } from "next/navigation";
import ChapterContent from "./ChapterContent";
import ChapterDocument from "./ChapterDocument";
import SlideGrid from "./ChapterSlideGrid";
import StaticLayout from "./StaticLayout";

export default async function ChapterPageBody({
  idpath,
}: {
  idpath: string[];
}) {
  const chapter = await data.getPieceWithChildren(idpath);
  if (chapter === null) {
    notFound();
  }

  const slides = await data.getPieceSlideList(chapter);

  let options = [];
  if (chapter.hasDoc) {
    options.push({
      name: "Document",
      component: <ChapterDocument idpath={idpath} />,
    });
  }
  if (chapter.numSlides > 0) {
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
