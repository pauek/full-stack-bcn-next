import { ContentPiece } from "@/lib/adt";
import { coverUrl, pieceUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import data from "@/lib/data";

type _Props = {
  session: ContentPiece;
};
export default async function SessionCard({ session }: _Props) {
  const showCover = await data.pieceHasCover(session);
  const { idpath, name, metadata } = session;
  const { index } = metadata;
  return (
    <Link href={pieceUrl(idpath)} className="w-1/3 aspect-[5/4] sm:aspect-[4/3]">
      <div
        className={cn(
          "h-full text-xs sm:text-sm",
          "flex flex-col relative items-stretch",
          "hover:bg-stone-50 hover:border-stone-400",
          "bg-slate-100 border rounded-md shadow m-1 overflow-clip"
        )}
      >
        <_Image visible={showCover} src={coverUrl(idpath)} />
        <_Label name={name} />
        <_Index index={index} />
      </div>
    </Link>
  );
}

const _Image = ({ visible: visible, src }: { visible: boolean; src: string }) => (
  <div className="flex-1 relative">
    {visible && <Image className="object-cover" src={src} alt="card cover" fill={true} />}
  </div>
);

const _Label = ({ name }: { name: string }) => (
  <div className="px-1 pb-1 pt-1.5 font-semibold bg-white border-t border-stone-200 text-center">
    {name}
  </div>
);

const _Index = ({ index }: { index: number }) => (
  <div
    className={cn(
      "w-[1.8em] h-[1.8em] absolute flex flex-col justify-center font-bold text-black",
      "items-center top-0.5 left-0.5 text-xs rounded-sm bg-white border"
    )}
  >
    {index}
  </div>
);
