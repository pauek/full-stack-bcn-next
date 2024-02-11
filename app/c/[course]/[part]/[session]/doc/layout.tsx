import ChapterLocalLinks from "@/components/ChapterLocalLinks";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "../common";

type _Props = SessionPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  return (
    <>
      <div className="flex-1 relative">
        <ChapterLocalLinks piece={piece} chapters={piece.children || []} />
      </div>
      <div className="max-w-[54em] w-[54em]">{children}</div>
      <div className="flex-1"></div>
    </>
  );
}
