import { getContentPiece } from "@/lib/files/files";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SessionButtonProps = {
  path: string[];
};
const SessionCard = async ({ path }: SessionButtonProps) => {
  const session = await getContentPiece(path);
  if (session === null) {
    throw `Session with path ${path} not found`;
  }
  return (
    <Link href={`/content/${path.join("/")}`} className="w-1/3">
      <div
        className={cn(
          "h-[7rem] text-xs sm:text-sm",
          "flex flex-col justify-end",
          "hover:bg-stone-50 hover:border-stone-400",
          "bg-white border rounded-md shadow m-1 overflow-clip"
        )}
      >
        <div className="bg-stone-200 flex-1 rounded-t"></div>
        <div className="px-3 py-1 pt-1.5 font-normal">{session.name}</div>
      </div>
    </Link>
  );
};

export default SessionCard;
