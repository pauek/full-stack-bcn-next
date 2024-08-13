import { filesBackend } from "@/lib/data/files"
import { MetadataLogFunc, courseUpdateMetadata } from "@/lib/data/files"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"

const logFunc: MetadataLogFunc = ({ idjpath, hasDoc, numSlides, index }) => {
  const _slides = numSlides > 0 ? `📊 ${numSlides}` : ""
  const _doc = hasDoc ? "📋" : ""
  console.log(`${idjpath} = [#${index}${_slides}${_doc}]`)
}

showExecutionTime(async () => {
  const root = await getRoot(filesBackend)
  await courseUpdateMetadata(filesBackend, root, logFunc)
})
