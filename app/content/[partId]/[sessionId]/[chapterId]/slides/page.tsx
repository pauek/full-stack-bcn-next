import ChapterMenu from "@/components/ChapterMenu";
import SlideGrid from "@/components/SlideGrid";
import { getSlidesList } from "@/lib/content-server";
import Image from "next/image";

export type ChapterPageProps = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};


export default async function Page({ params }: ChapterPageProps) {
  const { partId, sessionId, chapterId } = params;
  const path = [partId, sessionId, chapterId];
  const slides = await getSlidesList(path);

  // src={`${CONTENT_SERVER}/${path.join("/")}/slides/${s}`}
  // src={`/api/images/${path.join("/")}/slides/${s}`}

  return (
    <div className="pt-12">
      <ChapterMenu path={path} active="slides" />
      <SlideGrid path={path} slides={slides} />
    </div>
  );
}