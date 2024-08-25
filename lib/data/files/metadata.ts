import { ContentPieceMetadata, zContentPieceMetadata } from "@/lib/adt"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"

export const METADATA_FILENAME = ".meta.json"

const defaultValues = {
  numSlides: 0,
  hasDoc: false,
  level: 0,
}

export const readMetadata = async (diskpath: string): Promise<ContentPieceMetadata> => {
  try {
    const metadataPath = join(diskpath, METADATA_FILENAME)
    const bytes = await readFile(metadataPath)
    const fileMetadata = JSON.parse(bytes.toString())
    const metadata = { ...defaultValues, ...fileMetadata }
    return zContentPieceMetadata.parse(metadata) // Check fields
  } catch (e) {
    throw new Error(`Warning: error reading metadata for "${diskpath}": ${e}`)
  }
}

export const writeMetadata = async (dir: string, metadata: any) => {
  // Sort fields so that no extra git changes are generated
  const sortedMetadata = Object.fromEntries(
    Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b))
  )
  const json = JSON.stringify(sortedMetadata, null, 2) // Pretty print
  const path = join(dir, METADATA_FILENAME)
  await writeFile(path, json)
}

export const updateMetadata = async (diskpath: string, func: (metadata: any) => Promise<any>) => {
  const metadata = await readMetadata(diskpath)
  await func(metadata)
  await writeMetadata(diskpath, metadata)
  return metadata
}
