import Zoomable from "@/components/Zoomable"
import { FileReference } from "@/lib/data/data-backend"
import { attachmentUrl } from "@/lib/urls"
import { cn } from "@/lib/utils"
import NextImage from "next/image"

type _ImageProps = {
  border?: boolean
  zoomable?: boolean
  bgColor?: string
  padding?: string
}

export default function ImageForChapter(imageMap: Map<string, FileReference>) {
  return function Image(props: React.ComponentProps<"img"> & _ImageProps) {
    // Hay que insertar el id del Chapter para que el documento
    // pueda referirse a la imagen con un path relativo
    if (!props.src) {
      throw new Error("Image src missing!")
    }
    const fileref = imageMap.get(props.src)
    if (!fileref) {
      throw new Error(`Image "${props.src}" not found in imageMap!`)
    }

    const { zoomable = true, border = true, bgColor, padding } = props

    const Identity = ({ children }: { children: React.ReactNode }) => children
    const MaybeZoomable = zoomable ? Zoomable : Identity

    return (
      <div
        className={cn(border ? "border" : "", "my-4 flex justify-center items-center")}
        style={{ padding }}
      >
        <MaybeZoomable bgColor={bgColor}>
          <NextImage
            src={attachmentUrl(fileref)}
            alt={props.alt || "image"}
            width={Number(props.width)}
            height={Number(props.height)}
          />
        </MaybeZoomable>
      </div>
    )
  }
}
