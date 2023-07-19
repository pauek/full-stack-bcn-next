import { RedirectType } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

export default async function Page({ params }: any) {
  const { partId, sessionId, chapterId } = params;
  const url = ["", "content", partId, sessionId, chapterId, "doc"];
  redirect(url.join("/"), RedirectType.replace);
}
