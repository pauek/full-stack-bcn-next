import Zoomable from "@/components/Zoomable";
import { FileReference } from "@/lib/data/data-backend";
import { attachmentUrl } from "@/lib/urls";
import NextImage from "next/image";

export default function ImageForChapter(imageMap: Map<string, FileReference>) {
  return function Image({ src, alt, width, height }: React.ComponentProps<"img">) {
    // Hay que insertar el id del Chapter para que el documento
    // pueda referirse a la imagen con un path relativo
    if (!src) {
      throw new Error("Image src missing!");
    }
    const fileref = imageMap.get(src);
    if (!fileref) {
      throw new Error(`Image "${src}" not found in imageMap!`);
    }
    return (
      <div className="border my-4">
        <Zoomable>
          <NextImage
            src={attachmentUrl(fileref)}
            alt={alt || "image"}
            width={Number(width)}
            height={Number(height)}
          />
        </Zoomable>
      </div>
    );
  };
}
