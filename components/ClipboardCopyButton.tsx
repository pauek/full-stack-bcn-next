import { useEffect, useState } from "react";
import ClipboardCopy from "./icons/ClipboardCopy";
import CheckMark from "./icons/CheckMark";
import { cn } from "@/lib/utils";

type Props = {
  className: string;
  size: number;
  onClick: () => void;
};
export default function ClipboardCopyButton({ className, size, onClick }: Props) {
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (showCopied) {
      const timeout = setTimeout(() => setShowCopied(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [showCopied]);

  return (
    <div
      className={cn(
        "text-stone-400 absolute right-0 top-0 bottom-0 px-1",
        "cursor-pointer flex flex-col justify-center hover:bg-stone-100",
        "hover:text-black rounded",
        className
      )}
      onClick={() => {
        setShowCopied(true);
        onClick();
      }}
    >
      {showCopied ? (
        <CheckMark size={20} className="text-green-500" />
      ) : (
        <ClipboardCopy size={size} />
      )}
    </div>
  );
}
