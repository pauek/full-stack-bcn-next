import { HeaderTitle } from "@/components/HeaderTitle"
import Navigator from "@/components/Navigator"
import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import { SessionPageProps, getSessionWithChaptersOrNotFound } from "../utils"

type _Props = SessionPageProps & {
  children: React.ReactNode
}
export default async function Layout({ children, params }: _Props) {
  const course = await data.getPieceWithChildren([env.COURSE_ID])
  if (!course) {
    throw new Error(`Course not found: "${env.COURSE_ID}"`)
  }
  const session = await getSessionWithChaptersOrNotFound({ params })
  let index = -1
  if (course.children) {
    index = course.children.findIndex((p) => p.idpath.join("/") === session.idpath.join("/"))
  }

  const Header = () => (
    <div className="px-5 flex flex-row justify-center border-b w-full">
      <div className="h-full flex flex-row max-w-[54rem] w-full">
        <HeaderTitle title={session.name} subtitle={`SESSION ${session.metadata.index}`} />
      </div>
    </div>
  )

  const Page = () => (
    <div className="w-full bg-secondary pb-12 flex-1 relative flex flex-col">
      <div className="w-full h-full">{children}</div>
    </div>
  )

  return (
    <div id="top" className="w-full h-full flex flex-col flex-1">
      <Navigator pieceList={course.children || []} parent={course} index={-1} />
      <Header />
      <Page />
    </div>
  )
}

export async function generateMetadata({ params }: SessionPageProps) {
  const session = await getSessionWithChaptersOrNotFound({ params })
  return {
    title: `${session.name} - Full-stack Web Technologies`,
  }
}
