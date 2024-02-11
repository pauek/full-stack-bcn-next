import { FileReference } from "@/lib/data/data-backend";
import { attachmentUrl } from "@/lib/urls";
import NextImage from "next/image";

export default function ImageFromMap(imageMap: Map<string, FileReference>) {
  return function Image(props: React.ComponentProps<"img">) {
    // Hay que insertar el id del Chapter para que el documento
    // pueda referirse a la imagen con un path relativo
    return (
      <div className="border my-4">
        <NextImage
          src={attachmentUrl(imageMap.get(props.src!)!)}
          alt={props.alt || "image"}
          width={Number(props.width)}
          height={Number(props.height)}
        />
      </div>
    );
  };
}
