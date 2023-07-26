import { Session } from "@/lib/content-server";
import ChapterCard from "./ChapterCard";

type SessionMenuProps = {
  path: string[];
  session: Session;
};
export default function SessionMenu({ path, session }: SessionMenuProps) {
  if (!session) {
    return <></>;
  }
  return (
    <div className="gap-4 grid lg:grid-cols-2 max-md:grid-cols-1">
      {session.chapters.map((chapter) => (
        <ChapterCard key={chapter.id} path={path} chapter={chapter} />
      ))}
    </div>
  );
}
