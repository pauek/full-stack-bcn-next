import DarkModeAwareRoot from "@/components/DarkModeAwareBody"
import "../../globals.css"

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
}

type Props = {
  children: React.ReactNode
}
export default async function RootLayout({ children }: Props) {
  return (
    <DarkModeAwareRoot lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <body>{children}</body>
    </DarkModeAwareRoot>
  )
}
