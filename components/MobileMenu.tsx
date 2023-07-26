"use client";

import { useState } from "react";
import MobileMenuIcon from "./icons/MobileMenuIcon";

type Props = {
  children: React.ReactNode;
};
export default function MobileMenu({ children }: Props) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="fixed top-0.5 right-0.5 px-6 py-4 border z-11 shadow-sm bg-white rounded flex flex-col items-end pr-16">
        <div className="flex flex-col gap-4">{children}</div>
        <div className="text-right" onClick={() => setOpen(false)}>
          <MobileMenuIcon size={20} />
        </div>
      </div>
    );
  } else {
    return <div onClick={() => setOpen(true)}>
      <MobileMenuIcon size={20} />
    </div>;
  }
}
