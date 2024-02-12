import { WarningIcon } from "../icons/WarningIcon";

export default function Warn({ children }: React.ComponentProps<"div">) {
  return (
    <div className="warning mx-6">
      <WarningIcon className="text-yellow-600" />
      <div className="text-stone-900">{children}</div>
    </div>
  );
}
