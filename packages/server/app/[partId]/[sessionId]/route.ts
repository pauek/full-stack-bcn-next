import { getCourse, getPart, getSession } from "files";
import { respond } from "@/lib/http-responses";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
    sessionId: string;
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { partId, sessionId } = context.params;
  return respond([partId, sessionId], getSession);
}

export async function generateStaticParams({ params }: Context) {
  const { partId, sessionId } = params;
  const session = await getSession([partId, sessionId]);
  if (session === null) {
    return [];
  }
  return session.chapters.map((ch) => ({
    partId,
    sessionId,
    chapterId: ch.id,
  }));
}
