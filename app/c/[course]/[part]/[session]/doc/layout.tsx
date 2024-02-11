import ChapterLocalLinks from "@/components/ChapterLocalLinks";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "../common";

type _Props = SessionPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  return (
    <>
      <div className="hidden lg:block flex-1 relative">
        <ChapterLocalLinks piece={piece} chapters={piece.children || []} />
      </div>
      <div className="w-full max-w-[54em] w-[54em] m-auto">{children}</div>
      <div className="hidden lg:block flex-1"></div>
    </>
  );
}
