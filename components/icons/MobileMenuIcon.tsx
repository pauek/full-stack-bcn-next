type Props = {
  size: number
}
export default function MobileMenuIcon({ size }: Props) {
  return (
    <div className="bg-background">
      <svg fill="none" width={size} height={size} viewBox={`0 0 100 100`}>
        <path d="M0 10L100 10" stroke="currentColor" strokeWidth={10}></path>
        <path d="M0 50L100 50" stroke="currentColor" strokeWidth={10}></path>
        <path d="M0 90L100 90" stroke="currentColor" strokeWidth={10}></path>
      </svg>
    </div>
  )
}
