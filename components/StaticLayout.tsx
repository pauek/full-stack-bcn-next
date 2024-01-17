import Header from "./Header";

type Props = {
  path: string[];
  children: React.ReactNode;
};

export default function StaticLayout({ path, children }: Props) {
  return (
    <>
      <Header path={path} />
      <main className="pt-12 min-h-full">{children}</main>
    </>
  );
}
