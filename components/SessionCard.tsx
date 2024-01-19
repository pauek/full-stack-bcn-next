import { ContentPiece } from "@/lib/adt";
import { coverUrl, pieceUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";

type SessionButtonProps = {
  session: ContentPiece;
};
const SessionCard = async ({ session }: SessionButtonProps) => {
  return (
    <Link href={pieceUrl(session.idpath)} className="w-1/3">
      <div
        className={cn(
          "h-[7.8rem] w-[12em] text-xs sm:text-sm",
          "flex flex-col justify-start relative",
          "hover:bg-stone-50 hover:border-stone-400",
          "bg-slate-100 border rounded-md shadow m-1 overflow-clip"
        )}
      >
        <ImageWithFallback
          className="aspect-[16/9] object-contain"
          src={coverUrl(session.idpath)}
          alt="card cover"
          width={320}
          height={180}
        />
        <div className="flex-1"></div>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 px-3 py-1 pt-1.5",
            "bg-white border-t border-stone-200 font-semibold text-center"
          )}
        >
          {session.name}
        </div>
        <div
          className={cn(
            "w-[1.8em] h-[1.8em] absolute flex flex-col justify-center font-bold text-black",
            "items-center top-0.5 left-0.5 text-xs rounded-sm bg-white border"
          )}
        >
          {session.index}
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;
