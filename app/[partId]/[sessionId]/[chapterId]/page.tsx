import Chapter from "@/components/Chapter";
import { getChapter } from "@/lib/content-server";

type Props = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};

export default async function Page({ params }: Props) {
  const { partId, sessionId, chapterId } = params;
  const chapter: any = await getChapter([
    "fullstack",
    partId,
    sessionId,
    chapterId,
  ]);

  return (
    <>
      <div id="top" className="absolute top-0" />
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
    </>
  );
}
