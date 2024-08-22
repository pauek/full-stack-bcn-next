import Footer from "@/components/Footer"
import Header from "@/components/Header"
import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import { Analytics } from "@vercel/analytics/react"
import { notFound } from "next/navigation"
import "../globals.css"

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
}

type Props = {
  children: React.ReactNode
}
export default async function RootLayout({ children }: Props) {
  const course = await data.getPiece([env.COURSE_ID])
  if (!course) {
    notFound()
  }
  return (
    <>
      <div className="w-full h-full pt-12 flex flex-col">
        <Header course={course} />
        <main className="min-h-full w-full flex flex-col items-center">
          {children}
          <Footer />
        </main>
      </div>
      <Analytics />
    </>
  )
}
