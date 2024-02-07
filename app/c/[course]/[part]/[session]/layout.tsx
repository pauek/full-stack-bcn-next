import data from "@/lib/data";
import { notFound } from "next/navigation";
import TabButton from "./TabButton";
import { getTabs } from "./get-tabs";

type _Props = {
  children: React.ReactNode;
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export default async function Layout({ children, params }: _Props) {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const path = `/c/${course}/${part}/${session}`;
  const piece = await data.getPieceWithChildren(idpath);
  if (piece === null) {
    notFound();
  }

  const tabInfos = await getTabs();
  return (
    <div className="w-full h-full flex flex-col">
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
      <div className="bg-secondary pt-2 pb-12 flex-1">
        <div className="m-auto max-w-[54em]">{children}</div>
      </div>
    </div>
  );
}
