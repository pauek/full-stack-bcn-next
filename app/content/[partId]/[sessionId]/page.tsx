import SessionMenu from "@/components/SessionMenu";
import StaticLayout from "@/components/StaticLayout";
import { generateAllSessionParams, getSession } from "@/lib/content-server";

export async function generateStaticParams() {
  return generateAllSessionParams();
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
    <StaticLayout path={[partId, sessionId]}>
      <div className="max-w-[54em] m-auto">
        <div className="mx-4">
          <div id="top" className="absolute top-0" />
          <h2 className="pt-8 pb-6">{session.name}</h2>
          <SessionMenu path={[partId, sessionId]} session={session} />
        </div>
      </div>
    </StaticLayout>
  );
}
