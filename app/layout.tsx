import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { inter } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@highlightjs/cdn-assets/styles/a11y-light.min.css";
import "./globals.css";

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
};

type Props = {
  children: React.ReactNode;
  params: {
    idpath: string[];
  };
};
export default function RootLayout({ children, params }: Props) {
  let { idpath } = params;
  if (idpath === undefined) {
    idpath = [process.env.COURSE_ID!];
  }
  return (
    <html lang="en">
      <head></head>
      <body className={cn(inter.className, "h-screen flex flex-col")}>
        <div className="w-full h-full pt-12">
          <Header idpath={idpath} />
          <main className="min-h-full flex flex-col items-center">
            {children}
            <div className="flex-1"></div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
