import { inter } from "@/lib/fonts";
import "@highlightjs/cdn-assets/styles/a11y-light.min.css";
import "./globals.css";

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Postgraduate Degree on Full-Stack Web Technologies at UPC",
};

type Props = {
  children: React.ReactNode;
};
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className + ` bg-stone-50 h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
