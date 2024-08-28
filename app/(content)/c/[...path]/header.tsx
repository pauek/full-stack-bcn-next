import { ContentPiece } from "@/lib/adt"
import { AttachmentInfo } from "./utils"

type SubtitleTitleProps = {
  title: string
  subtitle: React.ReactNode
}
const SubtitleTitle = ({ title, subtitle }: SubtitleTitleProps) => (
  <h2 className="p-0 pb-2 pt-3 m-0">
    <div className="text-stone-400 text-xs m-0">{subtitle}</div>
    <div className="leading-9">{title}</div>
  </h2>
)

const wordForIdpath = (idpath: string[]) => {
  switch (idpath.length) {
    case 1:
      return "COURSE"
    case 2:
      return "PART"
    case 3:
      return "SESSION"
    case 4:
      return "CHAPTER"
    default:
      return "PIECE"
  }
}

interface HeaderProps {
  piece: ContentPiece
  attachments: Record<string, AttachmentInfo>
}
export const Header = ({ piece, attachments }: HeaderProps) => {
  return (
    <div className="px-5 flex flex-row justify-center border-b w-full bg-background">
      <div className="h-full flex flex-row max-w-[54rem] w-full items-end">
        <SubtitleTitle
          title={piece.name}
          subtitle={`${wordForIdpath(piece.idpath)} ${piece.metadata.index}`}
        />
        <div className="flex-1" />
      </div>
    </div>
  )
}
