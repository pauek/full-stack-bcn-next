import DarkModeAwareRoot from "@/components/DarkModeAwareBody";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { inter } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
};

type Props = {
  children: React.ReactNode;
};
export default async function RootLayout({ children }: Props) {
  const course = await data.getPiece([env.COURSE_ID]);
  if (!course) {
    notFound();
  }
  return (
    <DarkModeAwareRoot lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="css" href="/stackoverflow-dark.css" />
      </head>
      <body className={cn(inter.className, "h-screen flex flex-col")}>
        <div className="w-full h-full pt-12 flex flex-col">
          <Header course={course} />
          <main className="min-h-full w-full flex flex-col items-center">
            <div className="flex-1 w-full">{children}</div>
            <Footer />
          </main>
        </div>
        <Analytics />
      </body>
    </DarkModeAwareRoot>
  );
}
