import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};
export default function BreadCrumbsSlash({ className }: Props) {
  return (
    <div className={cn("relative h-[32px] w-0", className)}>
      <svg
        className="absolute top-0 left-[-14px] z-30"
        fill="none"
        width="32"
        height="32"
        shapeRendering="geometricPrecision"
        stroke="lightgray"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        viewBox="0 0 24 24"
      >
        <path d="M16.88 3.549L7.12 20.451"></path>
      </svg>
    </div>
  );
}
