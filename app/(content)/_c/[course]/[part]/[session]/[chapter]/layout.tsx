import { SubtitleTitle } from "@/components/SubtitleTitle"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"
import { getSessionWithChaptersOrNotFound } from "../utils"
import { ChapterPageProps, getChapterOrNotFound } from "./utils"
import Navigator from "@/components/Navigator"

type _Props = ChapterPageProps & {
  children: React.ReactNode
}
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params })
  const chapterList = session.children || []
  const chapter = await getChapterOrNotFound({ params })
  const index = chapterList.findIndex((ch) => ch.hash === chapter.hash)

  const Header = () => (
    <div className="px-5 flex flex-row justify-center border-b w-full">
      <div className="h-full flex flex-row items-end max-w-[54rem] w-full">
        <SubtitleTitle
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
  )

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row justify-center">
      <div className="w-full h-full max-w-[54rem] m-auto">{children}</div>
    </div>
  )

  return (
    <div id="top" className="w-full h-full flex flex-col justify-center bg-background">
      <Navigator pieceList={chapterList} parent={session} index={index} />
      <Header />
      <PageWrapper>{children}</PageWrapper>
    </div>
  )
}
