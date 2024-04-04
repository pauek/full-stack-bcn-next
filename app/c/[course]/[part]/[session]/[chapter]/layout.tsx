import ChapterLocalLinks from "@/components/ChapterLocalLinks";
import data from "@/lib/data";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { ChapterPageProps } from "./utils";

export const getSessionWithChaptersOrNotFound = async ({ params }: ChapterPageProps) => {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const piece = await unstable_cache(
    async () => await data.getPieceWithChildren(idpath),
    ["piece-with-children", idpath.join("/")]
  )();
  if (piece === null || piece.metadata.hidden) {
    notFound();
  }
  return piece;
};

type _Props = ChapterPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params });
  return (
    <div id="top" className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mx-5 flex flex-col">
        <h2 className="p-0 pb-3 pt-0 m-0 leading-9">
          <div className="text-stone-400 text-xs">SESSION {session.metadata.index}</div>
          {session.name}
        </h2>
      </div>

      <div className="border-b"></div>

      {/* Page */}
      <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row">
        <div className="hidden lg:block flex-1 relative">
          <ChapterLocalLinks session={session} chapters={session.children || []} />
        </div>
        <div className="w-full h-full max-w-[54em] m-auto">{children}</div>
        <div className="hidden lg:block flex-1"></div>
      </div>
    </div>
  );
}
