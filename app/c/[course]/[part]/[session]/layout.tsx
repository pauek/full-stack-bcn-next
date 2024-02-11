import { pieceUrl } from "@/lib/urls";
import TabButton from "./TabButton";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "./common";
import { getTabs } from "./get-tabs";

type _Props = SessionPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const path = pieceUrl(piece.idpath);

  const tabInfos = await getTabs(piece);

  return (
    <div id="top" className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mx-5 flex flex-col">
        <h2 className="p-0 pb-3 pt-0 m-0 leading-9">
          <div className="text-stone-400 text-xs">SESSION {piece.metadata.index}</div>
          {piece.name}
        </h2>
      </div>
      <div className="flex flex-row gap-2 cursor-pointer pl-5">
        {tabInfos.map(({ name, slug }, i) => (
          <TabButton key={i} name={name} slug={slug} path={path} />
        ))}
      </div>
      <div className="border-b"></div>

      {/* Page */}
      <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row">
        {children}
      </div>
    </div>
  );
}
