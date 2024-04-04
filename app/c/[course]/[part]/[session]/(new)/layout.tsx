import { HeaderTitle } from "@/components/HeaderTitle";
import data from "@/lib/data";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

export type SessionPageProps = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export const getSessionWithChaptersOrNotFound = async ({ params }: SessionPageProps) => {
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

type _Props = SessionPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params });
  const Header = () => (
    <>
      <div className="mx-5 flex flex-row items-end">
        <HeaderTitle title={session.name} subtitle={`SESSION ${session.metadata.index}`} />
      </div>
      <div className="border-b"></div>
    </>
  );

  const Page = () => (
    <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row">
      <div className="w-full h-full max-w-[54em] m-auto">{children}</div>
      <div className="hidden lg:block flex-1"></div>
    </div>
  );

  return (
    <div id="top" className="w-full h-full flex flex-col">
      <Header />
      <Page />
    </div>
  );
}
