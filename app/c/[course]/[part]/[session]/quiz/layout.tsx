type _Props = {
  children: React.ReactNode;
};
export default async function Layout({ children }: _Props) {
  return (
    <>
      <div className="flex-1"></div>
      <div className="w-full max-w-[54em]">{children}</div>
      <div className="flex-1"></div>
    </>
  );
}
