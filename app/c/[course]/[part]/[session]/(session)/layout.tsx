import { HeaderTitle } from "@/components/HeaderTitle";
import { SessionPageProps, getSessionWithChaptersOrNotFound } from "../utils";

type _Props = SessionPageProps & {
  children: React.ReactNode;
};
export default async function Layout({ children, params }: _Props) {
  const session = await getSessionWithChaptersOrNotFound({ params });

  const Header = () => (
    <div className="px-5 flex flex-row justify-center border-b w-full">
      <div className="h-full flex flex-row max-w-[54rem] w-full">
        <HeaderTitle title={session.name} subtitle={`SESSION ${session.metadata.index}`} />
      </div>
    </div>
  );

  const Page = () => (
    <div className="w-full bg-secondary pt-2 px-2 pb-12 flex-1 relative flex flex-row">
      <div className="w-full h-full max-w-[54rem] m-auto">{children}</div>
    </div>
  );

  return (
    <div id="top" className="w-full h-full flex flex-col">
      <Header />
      <Page />
    </div>
  );
}

export async function generateMetadata({ params }: SessionPageProps) {
  const session = await getSessionWithChaptersOrNotFound({ params });
  return {
    title: `${session.name} - Full-stack Web Technologies`,

  }
}