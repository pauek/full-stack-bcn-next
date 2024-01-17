"use client";

import { useRef } from "react";
import ClipboardCopyButton from "../ClipboardCopyButton";

type Props = {
  children: React.ReactNode;
};
export default function CopyableCommand({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative" ref={ref}>
      {children}
      <ClipboardCopyButton
        size={20}
        onClick={() =>
          navigator.clipboard.writeText(ref.current?.textContent ?? "")
        }
      />
    </div>
  );
}
