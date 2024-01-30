import data from "@/lib/data";
import ChapterItem from "./ChapterItem";

export default async function SessionPageBody({ idpath }: { idpath: string[] }) {
  const session = await data.getPieceWithChildren(idpath);
  if (session === null) {
    return <div className="text-red-500">Session with path "{idpath.join("/")}" not found</div>;
  }
  return (
    <div className="w-full p-4">
      <div className="md:max-w-[54em] m-auto py-4 pt-2 border rounded-lg bg-background">
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
    </div>
  );
}
