import Link from "next/link";

export default function Header() {
  return (
    <header className="h-12 flex flex-row items-center px-5 border-b-2">
      <Link href="/">Full-stack Web Technologies</Link>
    </header>
  );
}
