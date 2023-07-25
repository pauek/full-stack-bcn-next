import ChapterDocument from "@/components/ChapterDocument";
import ChapterMenuNEW from "@/components/ChapterMenuNEW";
import SlideGrid from "@/components/SlideGrid";
import {
  generateAllChapterParams,
  getChapter,
  getSlidesList,
} from "@/lib/content-server";

export async function generateStaticParams() {
  return generateAllChapterParams();
}

export default async function Page({ params }: any) {
  const { partId, sessionId, chapterId } = params;
  const path = [partId, sessionId, chapterId];

  const chapter = await getChapter(path);
  const slides = await getSlidesList(path);

  let options = [];
  if (chapter.hasDoc) {
    options.push({
      name: "Document",
      component: <ChapterDocument path={path} />,
    });
  }
  if (chapter.hasSlides) {
    options.push({
      name: "Slides",
      component: <SlideGrid path={path} slides={slides} />,
    });
  }

  return (
    <>
      <ChapterMenuNEW options={options} />
    </>
  );
}
