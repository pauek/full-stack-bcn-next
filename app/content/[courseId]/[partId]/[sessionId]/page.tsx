import ChapterItem from "@/components/ChapterCard";
import StaticLayout from "@/components/StaticLayout";
import { Chapter } from "@/lib/adt";
import { getAllSessionPaths, getPieceWithChildren } from "@/lib/files/files";

export async function generateStaticParams() {
  return await getAllSessionPaths(process.env.COURSE!);
}

type PageProps = {
  params: {
    courseId: string;
    partId: string;
    sessionId: string;
  };
};
export default async function Page({ params }: PageProps) {
  const { courseId, partId, sessionId } = params;
  const session = await getPieceWithChildren([courseId, partId, sessionId]);
  if (session === null) {
    throw `Session with path ${[courseId, partId, sessionId]} not found`;
  }
  return (
    <StaticLayout path={[courseId, partId, sessionId]}>
      <div className="max-w-[54em] w-full m-auto pb-6">
        <div className="mx-4">
          <div id="top" className="absolute top-0" />
          <div className="pt-8 border-b mb-6">
            <div className="text-stone-400 mb-0 text-xs">SESSION {session.index}</div>
            <h2 className="p-0 pb-2">{session.name}</h2>
          </div>
          <div className="flex flex-col gap-4">
            {session.children?.map((piece, index) => (
              <ChapterItem
                key={piece.id}
                index={index+1}
                chapter={piece as Chapter}
              />
            ))}
          </div>
        </div>
      </div>
    </StaticLayout>
  );
}
