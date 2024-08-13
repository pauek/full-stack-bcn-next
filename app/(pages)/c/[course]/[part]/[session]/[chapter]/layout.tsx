import { HeaderTitle } from "@/components/HeaderTitle"
import { pieceUrlPath } from "@/lib/urls"
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { getSessionWithChaptersOrNotFound } from "../utils"
import { ChapterPageProps, getChapterOrNotFound } from "./utils"

type _Props = ChapterPageProps & {
  children: React.ReactNode
}
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params })
  const chapterList = session.children || []
  const chapter = await getChapterOrNotFound({ params })
  const index = chapterList.findIndex((ch) => ch.hash === chapter.hash)

  const BigSlash = () => (
    <div className="hidden sm:block w-12 h-full relative overflow-clip">
      <div className="absolute -top-1 -bottom-1 left-[55%] w-[1px] bg-primary opacity-20 rotate-[12deg]"></div>
    </div>
  )

  const Header = () => (
    <div className="px-5 flex flex-row justify-center border-b w-full">
      <div className="h-full flex flex-row items-end max-w-[54rem] w-full">
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
  )

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row justify-center">
      <div className="w-full h-full max-w-[54rem] m-auto">{children}</div>
    </div>
  )

  const Navigator = () => (
    <div className="border-b p-1 px-3 text-xs text-stone-400 dark:text-stone-600 w-full flex flex-row justify-center">
      <div className="flex flex-row w-full max-w-[54rem]">
        {index > 0 ? (
          <Link href={pieceUrlPath(chapterList[index - 1].idpath)} className="flex-1">
            <ArrowLeftIcon />
            <div className="line-clamp-1">{chapterList[index - 1].name}</div>
          </Link>
        ) : (
          <div className="flex-1"></div>
        )}
        <div className="border-l mx-2"></div>
        <Link href={pieceUrlPath(session.idpath)} className="flex-1 flex flex-col items-center ">
          <ArrowUpIcon />
          <div className="line-clamp-1">{session.name}</div>
        </Link>
        <div className="border-l mx-2"></div>
        {index < chapterList.length - 1 ? (
          <Link
            href={pieceUrlPath(chapterList[index + 1].idpath)}
            className="flex-1 text-right flex flex-col items-end"
          >
            <ArrowRightIcon />
            <div className="line-clamp-1">{chapterList[index + 1].name}</div>
          </Link>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
    </div>
  )

  return (
    <div id="top" className="w-full h-full flex flex-col items-center">
      <Navigator />
      <Header />
      <PageWrapper>{children}</PageWrapper>
    </div>
  )
}
