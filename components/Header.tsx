import { CrumbData, getBreadcrumbs } from "@/lib/content-server";
import Link from "next/link";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

type CrumbProps = {
  crumb: CrumbData;
  position: number;
  isLast: boolean;
};
const Crumb = ({ crumb, position, isLast }: CrumbProps) => {
  let link;
  if (position === 0) {
    link = <Link href={`/#${crumb.path[0]}`}>{crumb.name}</Link>;
  } else if (isLast) {
    link = <div className="select-none">{crumb.name}</div>;
  } else {
    link = <Link href={`/content/${crumb.path.join("/")}`}>{crumb.name}</Link>;
  }
  return (
    <>
      <div className="mx-2 text-stone-300">
        <BreadCrumbsSlash />
      </div>
      {link}
    </>
  );
};

export default async function Header({ path }: { path: string[] }) {
  const crumbs = await getBreadcrumbs(path);
  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-white h-12 flex " +
        "flex-row items-center px-5 border-b z-10 shadow-sm"
      }
    >
      <Link href="/" className="font-bold">
        Full-stack Web Technologies
      </Link>
      {crumbs.length > 0 &&
        crumbs.map((cr, i) => (
          <Crumb
            key={cr.path.join("/")}
            crumb={cr}
            position={i}
            isLast={i === crumbs.length - 1}
          />
        ))}
    </header>
  );
}
