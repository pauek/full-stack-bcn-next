import SessionMenu from "@/components/SessionMenu";
import { getCourse, getPart, getSession } from "@/lib/content-server";

export async function generateStaticParams() {
  const { parts } = await getCourse();
  const result = [];
  for (const part of parts) {
    const { sessions } = await getPart([part.id]);
    for (const session of sessions) {
      result.push({ params: { partId: part.id, sessionId: session.id } });
    }
  }
  return result;
}

type PageProps = {
  params: {
    partId: string;
    sessionId: string;
  };
};
export default async function Page({ params }: PageProps) {
  const { partId, sessionId } = params;
  const session = await getSession([partId, sessionId]);
  return (
    <div className="p-5 max-w-4xl m-auto">
      <div id="top" className="absolute top-0" />
      <h2 className="pt-6 pb-6">{session.name}</h2>
      <SessionMenu path={[partId, sessionId]} session={session} />
    </div>
  );
}
