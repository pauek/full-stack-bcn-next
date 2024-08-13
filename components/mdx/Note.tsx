import { AttachmentIcon } from "../icons/AttachmentIcon"

export default function Warn({ children }: React.ComponentProps<"div">) {
  return (
    <div className="note">
      <AttachmentIcon className="text-green-600 text-lg" />
      <div className="text-stone-900">{children}</div>
    </div>
  )
}
