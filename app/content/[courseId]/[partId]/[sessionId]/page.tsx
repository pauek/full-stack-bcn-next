import SessionPageBody from "@/components/SessionPageBody";
import { getAllSessionPaths } from "@/lib/files/files";

export async function generateStaticParams() {
  return await getAllSessionPaths(process.env.COURSE!);
}

type PageProps = {
  params: {
    courseId: string;
    partId: string;
    sessionId: string;
  };
};
export default async function Page({ params }: PageProps) {
  const { courseId, partId, sessionId } = params;
  const idpath = [courseId, partId, sessionId];
  return <SessionPageBody idpath={idpath} />;
}
