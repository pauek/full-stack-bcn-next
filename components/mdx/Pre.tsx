import CopyableCode from "./CopyableCode";

export default function Pre({ children }: React.ComponentProps<"pre">) {
  return <CopyableCode>{children}</CopyableCode>;
}
