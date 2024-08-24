import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Analytics } from "@vercel/analytics/react"
import "../globals.css"

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
}

type Props = {
  children: React.ReactNode
}
export default async function RootLayout({ children }: Props) {
  return (
    <>
      <div id="curtain" className="-z-10 fixed top-0 left-0 right-0 bottom-0 bg-background"></div>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="w-full flex-1 flex flex-col items-center">
          {children}
          <Footer />
        </main>
      </div>
      <Analytics />
    </>
  )
}
