import { ContentDir, readTree } from "@/lib/content/content";
import Link from "next/link";

type Props = {
  item: ContentDir;
};

const Session = ({ item, partSlug }: Props & { partSlug: string }) => {
  const { slug } = item.metadata;
  return (
    <Link href={`/${partSlug}/${slug}`} >
      <div className="text-sm hover:bg-stone-100">{item.name}</div>
    </Link>
  );
};

const Part = ({ item }: Props) => {
  const { name, children } = item;
  const { slug } = item.metadata;
  return (
    <div className="border p-2 pt-1 mb-2">
      <h4 className="text-stone-500 font-bold mb-2">{name}</h4>
      <div className="pl-3">
        {children && children.map((child) => <Session partSlug={slug} item={child} />)}
      </div>
    </div>
  );
};

export default async function Home() {
  const parts = await readTree();
  return (
    <main className="p-4">
      {parts && parts.map((item) => <Part key={item.path} item={item} />)}
    </main>
  );
}
