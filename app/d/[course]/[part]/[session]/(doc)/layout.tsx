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
        <ChapterLocalLinks session={piece} chapters={piece.children || []} />
      </div>
      <div className="w-full max-w-[54rem] m-auto">{children}</div>
      <div className="hidden lg:block flex-1"></div>
    </>
  );
}
