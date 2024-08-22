import DarkModeAwareBody from "@/components/DarkModeAwareBody"
import Map from "@/components/map/Map"
import MapStateProvider from "@/components/map/map-context"
import "./globals.css"

export const metadata = {
  title: "Full-stack Web Technologies",
  description: "Posgrado en Tecnologías Web de UPC School",
}

type Props = {
  children: React.ReactNode
}
export default async function RootLayout({ children }: Props) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <DarkModeAwareBody lang="en">
        <MapStateProvider>
          <Map />
        </MapStateProvider>
        {children}
      </DarkModeAwareBody>
    </html>
  )
}
