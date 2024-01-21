import data from "@/lib/data";
import { notFound } from "next/navigation";
import ChapterContent from "./ChapterContent";
import ChapterDocument from "./ChapterDocument";
import SlideGrid from "./ChapterSlideGrid";
import FullPageLayout from "./FullPageLayout";

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
      component: <ChapterDocument idpath={idpath} />,
    });
  }
  if (chapter.metadata.numSlides > 0) {
    options.push({
      name: "Slides",
      component: <SlideGrid path={idpath} slides={slides} />,
    });
  }

  return (
    <FullPageLayout path={idpath}>
      <ChapterContent chapter={chapter} options={options} />
    </FullPageLayout>
  );
}
