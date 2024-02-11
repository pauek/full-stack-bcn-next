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
      const timeout = setTimeout(() => setShowCopied(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [showCopied]);

  return (
    <div
      className={cn(
        "text-code-foreground absolute right-0 top-0 p-[0.3em] px-1",
        "cursor-pointer flex flex-col justify-start",
        "hover:opacity-100 rounded ",
        className,
        showCopied ? "opacity-100" : "opacity-40",
      )}
      onClick={() => {
        setShowCopied(true);
        onClick();
      }}
    >
      {showCopied ? (
        <CheckMark size={18} className="text-green-500" />
      ) : (
        <ClipboardCopy size={size} />
      )}
    </div>
  );
}
