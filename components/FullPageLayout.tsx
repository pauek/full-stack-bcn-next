import Footer from "./Footer";
import Header from "./Header";

type Props = {
  path: string[];
  children: React.ReactNode;
};

export default function FullPageLayout({ path, children }: Props) {
  return (
    <div className="w-full h-full pt-12">
      <Header idpath={path} />
      <main className="min-h-full flex flex-col items-center">
        {children}
        <div className="flex-1"></div>
        <Footer path={path} />
      </main>
    </div>
  );
}
