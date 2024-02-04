import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { attachmentUrl, pieceUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type _Props = {
  session: ContentPiece;
};
export default async function SessionCard({ session }: _Props) {
  const [cover] = await data.getPieceAttachmentList(session, "cover");
  const { idpath, name, metadata } = session;
  const { index } = metadata;
  return (
    <Link href={pieceUrl(idpath)} className="w-1/3 aspect-[5/4] sm:aspect-[4/3]">
      <div
        className={cn(
          "h-full text-xs sm:text-sm",
          "flex flex-col relative items-stretch",
          "hover:border-foreground",
          "bg-muted border rounded-md shadow shadow-foreground-50 m-1 overflow-clip"
        )}
      >
        <_Image fileref={cover} />
        <_Label name={name} />
        <_Index index={index} />
      </div>
    </Link>
  );
}

const _Image = ({ fileref }: { fileref: FileReference | undefined }) => (
  <div className="flex-1 relative">
    {fileref && <Image className="object-cover" src={attachmentUrl(fileref)} alt="card cover" fill={true} />}
  </div>
);

const _Label = ({ name }: { name: string }) => (
  <div className="px-1 pb-1 pt-1.5 font-semibold bg-card border-t border-secondary text-center">
    {name}
  </div>
);

const _Index = ({ index }: { index: number }) => (
  <div
    className={cn(
      "w-[1.8em] h-[1.8em] absolute flex flex-col justify-center font-bold",
      "items-center top-0.5 left-0.5 text-xs rounded-sm bg-card border"
    )}
  >
    {index}
  </div>
);
