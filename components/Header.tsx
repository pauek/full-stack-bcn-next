"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

const getBreadcrumbs = async (segments: string[]): Promise<CrumbData[]> => {
  const response = await fetch(`/api/breadcrumbs/${segments.join("/")}`);
  return (await response.json()) as CrumbData[];
};

type CrumbData = {
  name: string;
  path: string[];
};

export const useBreadcrumbs = (): CrumbData[] => {
  // NOTE: Get rid of "content" which is first
  const [_, ...segments] = useSelectedLayoutSegments();
  const [crumbs, setCrumbs] = useState<CrumbData[]>([]);
  const joinedSegments = segments.join("/");

  useEffect(() => {
    getBreadcrumbs(segments).then(setCrumbs);
  }, [joinedSegments]);

  return crumbs;
};

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

export default function Header() {
  const crumbs = useBreadcrumbs();
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
