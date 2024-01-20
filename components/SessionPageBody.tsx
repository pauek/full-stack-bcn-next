import data from "@/lib/data";
import ChapterItem from "./ChapterItem";
import StaticLayout from "./StaticLayout";

export default async function SessionPageBody({
  idpath,
}: {
  idpath: string[];
}) {
  const session = await data.getPieceWithChildren(idpath);
  if (session === null) {
    throw `Session with path ${idpath} not found`;
  }
  return (
    <StaticLayout path={idpath}>
      <div className="max-w-[54em] w-full m-auto pb-6">
        <div className="mx-4">
          <div id="top" className="absolute top-0" />
          <div className="pt-8 border-b mb-6">
            <div className="text-stone-400 mb-0 text-xs">
              SESSION {session.index}
            </div>
            <h2 className="p-0 pb-2">{session.name}</h2>
          </div>
          <div className="flex flex-col gap-4">
            {session.children?.map((piece, index) => (
              <ChapterItem
                key={piece.id}
                index={index + 1}
                chapter={piece}
              />
            ))}
          </div>
        </div>
      </div>
    </StaticLayout>
  );
}
