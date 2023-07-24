import { Chapter } from "@/lib/content-server";
import Link from "next/link";

type ChapterCardProps = {
  path: string[];
  chapter: Chapter;
};
export default function ChapterCard({ path, chapter }: ChapterCardProps) {
  return (
    <Link href={`/content/${path!.join("/")}/${chapter.id}`}>
      <div className="border p-3 rounded shadow-sm bg-white hover:border-black">
        <div className="font-bold">{chapter.name}</div>
      </div>
    </Link>
  );
}
