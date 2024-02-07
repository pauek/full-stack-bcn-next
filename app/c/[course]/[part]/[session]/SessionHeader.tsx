import { ContentPiece } from "@/lib/adt";
import { readMetadata } from "@/lib/data/files";
import { pieceUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { readdir } from "fs/promises";
import Link from "next/link";
import { join } from "path";

type Option = {
  name: string;
  slug: string;
};

/*

This hack will show as a session options the folders in the current
directory, using as slug the name of the dir and taking the name
to show in the app from the .meta.json file.

*/
const getOptions = async () => { 
  const options: Option[] = [];
  const baseDir = "./app/c/[course]/[part]/[session]";
  for (const ent of await readdir(baseDir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      const metadata = await readMetadata(join(baseDir, ent.name));
      options.push({
        slug: ent.name,
        name: metadata.name,
      });
    }
  }
  return options;
};

type Props = {
  path: string;
  activeSlug: string;
  piece: ContentPiece;
};
export default async function SessionHeader({ path, activeSlug, piece }: Props) {
  const options = await getOptions();

  const Option = ({ name, slug: slug }: Option) => (
    <div
      className={cn(
        "p-0 ",
        slug === activeSlug
          ? "border-b-2 border-foreground text-foreground"
          : "text-muted-foreground"
      )}
    >
      <Link href={`${path}/${slug}`}>
        <div className="m-1 p-1 px-2 hover:bg-muted rounded transition-color text-sm">{name}</div>
      </Link>
    </div>
  );

  return (
    <>
      <div className="mx-5 flex flex-col">
        <Link href={pieceUrl(piece.idpath)}>
          <h2 className="p-0 pb-3 pt-0 m-0 leading-9">
            <div className="text-stone-400 text-xs">SESSION {piece.metadata.index}</div>
            {piece.name}
          </h2>
        </Link>
      </div>
      <div className="flex flex-row gap-2 cursor-pointer pl-5">
        {options.map(({ name, slug }, i) => (
          <Option key={i} name={name} slug={slug} />
        ))}
      </div>
      <div className="border-b mb-5"></div>
    </>
  );
}
