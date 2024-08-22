import DarkModeAwareRoot from "@/components/DarkModeAwareBody"
import "../../globals.css"
import Map from "@/components/Map"
import data from "@/lib/data"

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
}

type Props = {
  children: React.ReactNode
}
export default async function RootLayout({ children }: Props) {
  const mapPositions = await data.getMapPositionsExtended()
  return (
    <DarkModeAwareRoot lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <body id="page-box">
        <Map mapPositions={mapPositions} />
        {children}
      </body>
    </DarkModeAwareRoot>
  )
}
