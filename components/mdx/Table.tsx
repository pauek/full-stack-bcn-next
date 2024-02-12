import { cn } from "@/lib/utils";

export const Table = (props: React.ComponentProps<"table">) => (
  <div className="flex flex-row justify-center py-2">
    <table {...props}>{props.children}</table>
  </div>
);

export const Td = (props: React.ComponentProps<"td">) => (
  <td className="px-3 py-1 border-y">{props.children}</td>
);

export const Th = (props: React.ComponentProps<"th">) => (
  <th className={cn("px-3 py-1 text-left text-bold", props.className)}>{props.children}</th>
);
