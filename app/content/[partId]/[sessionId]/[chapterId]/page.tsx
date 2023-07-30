import ChapterDocument from "@/components/ChapterDocument";
import ChapterContent from "@/components/ChapterContent";
import SlideGrid from "@/components/ChapterSlideGrid";
import StaticLayout from "@/components/StaticLayout";
import {
  allChapterPaths,
  getChapter,
  getSlidesList,
} from "@/lib/content-server";

export async function generateStaticParams() {
  return allChapterPaths();
}

export default async function Page({ params }: any) {
  const { partId, sessionId, chapterId } = params;
  const path = [partId, sessionId, chapterId];

  const chapter = await getChapter(...path);
  const slides = await getSlidesList(path);

  let options = [];
  if (chapter.hasDoc) {
    options.push({
      name: "Document",
      component: <ChapterDocument path={path} />,
    });
  }
  if (chapter.numSlides > 0) {
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
