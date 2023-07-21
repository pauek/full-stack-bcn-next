import { getSession } from "@/lib/content-server";
import Link from "next/link";

type SessionButtonProps = {
  id: string[];
};
const SessionButton = async ({ id }: SessionButtonProps) => {
  const session = await getSession(id);
  return (
    <Link href={`/content/${id.join("/")}`} className="w-1/5">
      <div
        className={
          "text-sm hover:bg-stone-50 hover:border-stone-400" +
          " bg-white px-3 py-1.5 border rounded shadow m-1"
        }
      >
        {session.name}
      </div>
    </Link>
  );
};

export default SessionButton;