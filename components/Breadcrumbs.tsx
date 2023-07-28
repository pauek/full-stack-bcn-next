import { CrumbData, getBreadcrumbs } from "@/lib/content-server";
import MobileMenu from "./MobileMenu";
import Link from "next/link";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

type CrumbProps = {
  crumb: CrumbData;
  position: number;
  isLast: boolean;
};

const CrumbLink = ({ crumb, position, isLast }: CrumbProps) => {
  if (isLast) {
    return <div className="select-none text-stone-400">{crumb.name}</div>;
  } else  {
    return <Link href={`/content/${crumb.path.join("/")}`}>{crumb.name}</Link>;
  }
};

const Crumb = ({ crumb, position, isLast }: CrumbProps) => {
  return (
    <>
      <div className={"mx-2 text-stone-300 "}>
        <BreadCrumbsSlash />
      </div>
      <CrumbLink crumb={crumb} position={position} isLast={isLast} />
    </>
  );
};

type Props = {
  path: string[];
}
export default async function Breadcrumbs({ path }: Props) {
  const [__part, ...crumbs] = await getBreadcrumbs(path);
  return (
    <>
      <div className="hidden sm:flex flex-row items-center">
        {crumbs.length > 1 &&
          crumbs.map((cr, i) => (
            <Crumb
              key={cr.path.join("/")}
              crumb={cr}
              position={i}
              isLast={i === crumbs.length - 1}
            />
          ))}
      </div>
      {crumbs.length > 0 && (
        <div className="sm:hidden flex-1 flex flex-row justify-end">
          <MobileMenu>
            {crumbs.slice(0, crumbs.length - 1).map((cr, i) => (
              <CrumbLink
                key={cr.path.join("/")}
                crumb={cr}
                position={i}
                isLast={i === crumbs.length - 1}
              />
            ))}
          </MobileMenu>
        </div>
      )}
    </>
  );
}
