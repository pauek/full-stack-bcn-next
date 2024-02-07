import data from "@/lib/data";
import { notFound } from "next/navigation";
import SessionHeader from "../SessionHeader";

type _Props = {
  children: React.ReactNode;
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export default async function Layout({ children, params }: _Props) {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const path = `/c/${course}/${part}/${session}`
  const piece = await data.getPieceWithChildren(idpath);
  if (piece === null) {
    notFound();
  }
  return (
    <div className="w-full">
      <SessionHeader path={path} activeSlug={"doc"} piece={piece} />
      <div>{children}</div>
    </div>
  );
}
