import { courseUpdateMetadata, MetadataLogFunc } from "@/lib/data/files/metadata"
import { filesGetRootIdpath } from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"

const logFunc: MetadataLogFunc = ({ idjpath, hasDoc, numSlides, index }) => {
  const _slides = numSlides > 0 ? `📊 ${numSlides}` : ""
  const _doc = hasDoc ? "📋" : ""
  console.log(`${idjpath} = [#${index}${_slides}${_doc}]`)
}

showExecutionTime(async () => {
  const rootIdpath = await filesGetRootIdpath()
  await courseUpdateMetadata(rootIdpath, logFunc)
})
