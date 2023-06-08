import { ContentDir, loadContent } from "@/lib/content/content";
import { range } from "@/lib/content/utils";
import Link from "next/link";

type Props = {
  session: ContentDir;
};

const Session = ({ session, partSlug }: Props & { partSlug: string }) => {
  const { slug } = session.metadata;
  return (
    <Link href={`/${partSlug}/${slug}`} className="w-1/5">
      <div className="text-sm hover:bg-stone-50 hover:border-stone-400 bg-white px-3 py-1.5 border rounded shadow m-1">
        {session.name}
      </div>
    </Link>
  );
};

const Part = ({ session: item }: Props) => {
  const { name, children } = item;
  const { slug } = item.metadata;

  const childrenInRow = (n: number) =>
    children?.filter((ch) => ch.metadata.row === n);

  const Row = ({ n }: { n: number }) => (
    <div key={n} className="flex flex-row justify-center">
      {childrenInRow(n)?.map((session) => (
        <Session key={session.path} partSlug={slug} session={session} />
      ))}
    </div>
  );

  const Rows = () => (
    <>
      {range(0, 10).map((n) => (
        <Row key={n} n={n} />
      ))}
    </>
  );

  return (
    <div className="py-3 border-t relative last-of-type:border-b first-of-type:mt-1">
      <h4 className="text-stone-500 mb-2 text-sm font-light absolute top-1 mt-0">
        {name}
      </h4>
      <Rows />
    </div>
  );
};

export default async function Home() {
  const [root] = await loadContent();
  const { children } = root;
  return (
    <div className="max-w-4xl m-auto py-3">
      {children &&
        children.map((item) => <Part key={item.path} session={item} />)}
    </div>
  );
}
