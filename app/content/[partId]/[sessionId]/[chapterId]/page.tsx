import { generateAllChapterParams, getCourse, getPart, getSession } from "@/lib/content-server";
import { RedirectType } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return generateAllChapterParams();
}

export default async function Page({ params }: any) {
  const { partId, sessionId, chapterId } = params;
  const url = ["", "content", partId, sessionId, chapterId, "doc"];
  redirect(url.join("/"), RedirectType.replace);
}
