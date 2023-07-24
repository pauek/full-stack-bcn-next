import Link from "next/link";

type ChapterMenuProps = {
  path: string[];
  active: string;
};
export default function ChapterMenu({ path, active }: ChapterMenuProps) {
  const basePath = `/content/${path.join("/")}`;

  const _Link = ({ where, text }: { where: string; text: string }) => (
    <Link
      href={`${basePath}/${where}`}
      className={
        "py-2 " +
        (where === active
          ? "border-b-2 border-black text-black"
          : "text-stone-500")
      }
    >
      {text}
    </Link>
  );

  return (
    <div className="fixed z-20 top-12 left-0 right-0 bg-white border-b text-sm flex flex-row gap-5 pl-5 shadow-sm">
      <_Link text="Document" where="doc" />
      <_Link text="Slides" where="slides" />
    </div>
  );
}
