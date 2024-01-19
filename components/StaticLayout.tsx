import Footer from "./Footer";
import Header from "./Header";

type Props = {
  path: string[];
  children: React.ReactNode;
};

export default function StaticLayout({ path, children }: Props) {
  return (
    <>
      <Header idpath={path} />
      <main className="pt-12 min-h-full flex flex-col items-stretch">
        {children}
        <div className="flex-1"></div>
        <Footer path={path} />
      </main>
    </>
  );
}
