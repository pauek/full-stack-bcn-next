"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

const getBreadcrumbs = async (segments: string[]) => {
  const response = await fetch(`/api/breadcrumbs/${segments.join("/")}`);
  return await response.json();
};

export const useBreadcrumbs = (): string[] => {
  const segments = useSelectedLayoutSegments();
  const [crumbs, setCrumbs] = useState<string[]>([]);

  useEffect(() => {
    getBreadcrumbs(segments).then(setCrumbs);
  }, [segments]);

  return crumbs;
};

const Crumb = ({ name }: { name: string }) => {
  return (
    <>
      <div className="mx-2 text-stone-300">
        <BreadCrumbsSlash />
      </div>
      <div>{name}</div>
    </>
  );
};

export default function Header() {
  const crumbs = useBreadcrumbs();
  return (
    <header className="h-12 flex flex-row items-center px-5 border-b">
      <Link href="/" className="font-bold">Full-stack Web Technologies</Link>
      {crumbs && crumbs.map((c) => <Crumb name={c} />)}
    </header>
  );
}
