import { getCourse, getPart } from "files";
import { respond } from "@/lib/http-responses";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { partId } = context.params;
  return respond([partId], getPart);
}

export async function generateStaticParams() {
  const course = await getCourse();
  if (course === null) {
    return [];
  }
  return course.parts.map(part => ({ partId: part.id }));
}
