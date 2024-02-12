import { cn } from "@/lib/utils";

export default function Focus(props: React.ComponentProps<"span">) {
  return (
    <span {...props} className={cn("focus", props.className)}>
      {props.children}
    </span>
  );
}
