import { getContentPiece } from "@/lib/files/files";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SessionButtonProps = {
  path: string[];
};
const SessionButton = async ({ path }: SessionButtonProps) => {
  const session = await getContentPiece(path);
  if (session === null) {
    throw `Session with path ${path} not found`;
  }
  return (
    <Link href={`/content/${path.join("/")}`} className="w-1/3">
      <div
        className={cn(
          "h-[3.5rem] text-sm text-center",
          "flex flex-col justify-center items-center",
          "hover:bg-stone-50 hover:border-stone-400",
          "bg-white px-4 py-2 border rounded-md shadow m-1"
        )}
      >
        <div className="font-normal">{session.name}</div>
      </div>
    </Link>
  );
};

export default SessionButton;
