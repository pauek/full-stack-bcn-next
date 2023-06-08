"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
};
export default function Collapsible({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={`${collapsed ? `h-8` : ``} w-full bg-red-100 cursor-pointer overflow-hidden`}
      onClick={() => setCollapsed((x) => !x)}
    >
      {children}
    </div>
  );
}
