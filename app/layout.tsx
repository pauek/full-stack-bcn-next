import { inter } from "@/lib/fonts";
import "@highlightjs/cdn-assets/styles/a11y-light.min.css";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
};

type Props = {
  children: React.ReactNode;
};
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head></head>
      <body className={cn(inter.className, "h-screen flex flex-col")}>{children}</body>
    </html>
  );
}
