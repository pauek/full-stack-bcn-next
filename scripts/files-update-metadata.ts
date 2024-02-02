import { filesBackend } from "@/lib/data";
import { MetadataLogFunc, courseUpdateMetadata } from "@/lib/data/files";
import { getCourseRoot } from "@/lib/data/root";

const logFunc: MetadataLogFunc = ({ idjpath, hasDoc, numSlides, index }) => {
  const _slides = numSlides > 0 ? `📊 ${numSlides}` : "";
  const _doc = hasDoc ? "📋" : "";
  console.log(`${idjpath} = [#${index}${_slides}${_doc}]`);
};

const root = await getCourseRoot();
await courseUpdateMetadata(filesBackend, root, logFunc);
