type Props = {
  size: number;
};
export default function MobileMenuButton({ size }: Props) {
  return (
    <div className="fixed top-2.5 right-3 bg-white p-1 pl-3.5">
      <svg fill="none" width={size} height={size} viewBox={`0 0 100 100`}>
        <path d="M0 10L100 10" stroke="currentColor" strokeWidth={10}></path>
        <path d="M0 50L100 50" stroke="currentColor" strokeWidth={10}></path>
        <path d="M0 90L100 90" stroke="currentColor" strokeWidth={10}></path>
      </svg>
    </div>
  );
}
