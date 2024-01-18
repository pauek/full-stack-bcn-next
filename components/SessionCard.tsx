import { ContentPiece } from "@/lib/adt";
import { getPieceWithChildren } from "@/lib/files/files";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SessionButtonProps = {
  session: ContentPiece;
};
const SessionCard = async ({ session }: SessionButtonProps) => {
  return (
    <Link href={`/content/${session.path.join("/")}`} className="w-1/3">
      <div
        className={cn(
          "h-[7rem] text-xs sm:text-sm",
          "flex flex-col justify-end relative",
          "hover:bg-stone-50 hover:border-stone-400",
          "bg-white border rounded-md shadow m-1 overflow-clip"
        )}
      >
        <div className="bg-stone-200 flex-1 rounded-t"></div>
        <div className="px-3 py-1 pt-1.5 font-normal">{session.name}</div>
        <div className="absolute top-1 left-1 text-xs">{session.index}</div>
      </div>
    </Link>
  );
};

export default SessionCard;
