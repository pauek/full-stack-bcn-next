import { pieceUrlPath } from "@/lib/urls";
import Link from "next/link";
import { ChapterPageProps, getChapterOrNotFound } from "./utils";
import { getSessionWithChaptersOrNotFound } from "../(new)/layout";
import { HeaderTitle } from "@/components/HeaderTitle";

type _Props = ChapterPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params });
  const chapter = await getChapterOrNotFound({ params });

  const BigSlash = () => (
    <div className="hidden sm:block w-12 h-full relative overflow-clip">
      <div className="absolute -top-1 -bottom-1 left-[55%] w-[1px] bg-primary opacity-20 rotate-[12deg]"></div>
    </div>
  );

  const Header = () => (
    <div className="px-5 flex flex-row items-end border-b">
      <div className="h-full flex flex-row items-end">
        <HeaderTitle
          title={chapter.name}
          subtitle={
            <>
              <Link href={pieceUrlPath(session.idpath)}>SESSION {session.metadata.index}</Link>{" "}
              &ndash; CHAPTER {chapter.metadata.index}
            </>
          }
        />
      </div>
    </div>
  );

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row justify-center">
      <div className="w-full h-full max-w-[54em] m-auto">{children}</div>
    </div>
  );

  return (
    <div id="top" className="w-full h-full flex flex-col">
      <Header />
      <PageWrapper>{children}</PageWrapper>
    </div>
  );
}
