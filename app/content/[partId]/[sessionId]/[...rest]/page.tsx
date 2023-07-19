import Chapter from "@/components/Chapter";
import { getChapter } from "@/lib/content-server";
import Link from "next/link";

type PageProps = {
  params: {
    partId: string;
    sessionId: string;
    rest: string[];
  };
};

export default async function Page({ params }: PageProps) {
  const { partId, sessionId, rest } = params;
  const [chapterId, section] = rest;
  const path = ["fullstack", partId, sessionId, chapterId];
  const chapter: any = await getChapter(path);

  const ChapterMenu = () => {
    const basePath = `/content/${path.join("/")}`;
    return (
      <div className="bg-white border-b text-sm flex flex-row py-2 px-5 gap-5">
        <Link href={`${basePath}/doc`}>Document</Link>
        <Link href={`${basePath}/slides`}>Slides</Link>
        <Link href={`${basePath}/exercises`}>Exercises</Link>
      </div>
    );
  };

  return (
    <>
      <div id="top" className="absolute top-0" />
      <ChapterMenu />
      <div className="flex flex-row justify-center">
        <div className="relative flex flex-row m-auto max-w-6xl">
          <div className="px-10 pt-6 max-w-2xl bg-white pb-20">
            <div className="text-sm">
              <Chapter
                key={chapter.path}
                id={["fullstack", partId, sessionId, chapterId]}
              />
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </>
  );
}
