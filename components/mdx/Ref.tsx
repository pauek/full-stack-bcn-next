import Link from "next/link";

type Props = {
  children: React.ReactNode;
  path: string;
};
export default function Ref({ children, path }: Props) {
  return (
    <Link className="text-blue-600" href={path}>
      {children}
    </Link>
  );
}
