import ChapterDocument from "@/components/ChapterDocument";
import ChapterMenu from "@/components/ChapterMenu";
import { generateAllChapterParams } from "@/lib/content-server";

export async function generateStaticParams() {
  return generateAllChapterParams();
}

export type ChapterPageProps = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};

export default async function Page({ params }: ChapterPageProps) {
  const { partId, sessionId, chapterId } = params;
  const path = [partId, sessionId, chapterId];
  return (
    <div className="pt-12">
      <ChapterMenu path={path} active="doc" />
      <ChapterDocument key={path.join("/")} id={[...path]} />
    </div>
  );
}
