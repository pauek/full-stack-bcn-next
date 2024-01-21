import data from "@/lib/data";
import ChapterItem from "./ChapterItem";
import StaticLayout from "./StaticLayout";

export default async function SessionPageBody({ idpath }: { idpath: string[] }) {
  const session = await data.getPieceWithChildren(idpath);
  if (session === null) {
    throw `Session with path ${idpath} not found`;
  }
  return (
    <StaticLayout path={idpath}>
      <div className="md:w-[54em] md:m-auto md:mt-4 m-4 pb-5 border rounded-lg bg-white">
          <div className="pt-4 mx-4">
            <div className="text-stone-400 mb-0 text-xs">SESSION {session.metadata.index}</div>
            <h2 className="p-0 pb-3">{session.name}</h2>
          </div>
          <div className="border-b mb-5"></div>
          <div className="flex flex-col gap-4 mx-5">
            {session.children?.map((piece, index) => (
              <ChapterItem key={piece.id} index={index + 1} chapter={piece} />
            ))}
          </div>
      </div>
    </StaticLayout>
  );
}
