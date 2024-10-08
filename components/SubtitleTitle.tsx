type SubtitleTitleProps = {
  title: string
  subtitle: React.ReactNode
}
export const SubtitleTitle = ({ title, subtitle }: SubtitleTitleProps) => (
  <h2 className="p-0 pb-2 pt-3 m-0">
    <div className="text-stone-400 text-xs m-0">{subtitle}</div>
    <div className="leading-9">{title}</div>
  </h2>
)
