import Header from "@/components/Header";
import "./globals.css";
import "@highlightjs/cdn-assets/styles/a11y-light.min.css";
import { inter } from "@/lib/fonts";

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
        <Header />
        <main className="pt-12 min-h-full">
          {children}
          <div className="flex-1 bg-red-50"></div>
        </main>
      </body>
    </html>
  );
}
