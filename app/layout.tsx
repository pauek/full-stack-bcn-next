import Header from "@/components/Header";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Header />
        <main className="bg-stone-50 min-h-screen">
        {children}
        </main>
      </body>
    </html>
  );
}
