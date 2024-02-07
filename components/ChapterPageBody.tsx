import data from "@/lib/data";
import { notFound } from "next/navigation";
import ChapterContent from "./ChapterContent";
import ChapterDocument from "./ChapterDocument";
import SlideGrid from "./SlideGrid";
import { attachmentUrl } from "@/lib/urls";

export default async function ChapterPageBody({ idpath }: { idpath: string[] }) {
  const chapter = await data.getPieceWithChildren(idpath);
  if (chapter === null) {
    notFound();
  }
  const slides = await data.getPieceAttachmentList(chapter, "slide");

  let options = [];
  if (chapter.metadata.hasDoc) {
    options.push({
      name: "Document",
      component: <ChapterDocument chapter={chapter} />,
    });
  }
  if (slides.length > 0) {
    options.push({
      name: "Slides",
      component: <SlideGrid slides={slides.map((ref) => attachmentUrl(ref))} />,
    });
  }

  return <ChapterContent chapter={chapter} options={options} />;
}
