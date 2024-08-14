import Map from "@/components/Map"
import data from "@/lib/data"

export default async function Page() {
  const mapPositions = await data.getMapPositionsExtended()
  return (
    <div id="page-box">
      <Map mapPositions={mapPositions} />
    </div>
  )
}
