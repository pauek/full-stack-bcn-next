import { getSession } from "@/lib/content-server";
import Link from "next/link";

type SessionButtonProps = {
  path: string[];
};
const SessionButton = async ({ path }: SessionButtonProps) => {
  const session = await getSession(...path);
  return (
    <Link href={`/content/${path.join("/")}`} className="w-1/3">
      <div
        className={
          "text-sm flex flex-wrap justify-center items-center text-center hover:bg-stone-50 hover:border-stone-400" +
          " bg-white px-4 py-2 border rounded-md shadow m-1 md:h-[2.5rem] h-[3.5rem]"
        }
      >
        {session.name}
      </div>
    </Link>
  );
};

export default SessionButton;