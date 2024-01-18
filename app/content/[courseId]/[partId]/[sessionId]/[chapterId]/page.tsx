import ChapterContent from "@/components/ChapterContent";
import ChapterDocument from "@/components/ChapterDocument";
import SlideGrid from "@/components/ChapterSlideGrid";
import StaticLayout from "@/components/StaticLayout";
import {
  pieceNumSlides,
  generateAllChapterParams,
  getPieceWithChildren,
  getSlideList,
  pieceHasDoc,
} from "@/lib/files/files";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return await generateAllChapterParams(process.env.COURSE!);
}

export default async function Page({ params }: any) {
  const { courseId, partId, sessionId, chapterId } = params;
  const path = [courseId, partId, sessionId, chapterId];

  const chapter = await getPieceWithChildren(path);
  if (chapter === null) {
    notFound();
  }

  const slides = await getSlideList(chapter);

  let options = [];
  if (await pieceHasDoc(chapter)) {
    options.push({
      name: "Document",
      component: <ChapterDocument path={path} />,
    });
  }
  if ((await pieceNumSlides(chapter)) > 0) {
    options.push({
      name: "Slides",
      component: <SlideGrid path={path} slides={slides} />,
    });
  }

  return (
    <StaticLayout path={path}>
      <ChapterContent chapter={chapter} options={options} />
    </StaticLayout>
  );
}
