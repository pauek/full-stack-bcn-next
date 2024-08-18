import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { collectAnswersForPiece, writeAnswers } from "./quiz"
import { getPieceSlideList } from "./attachments"
import { pieceHasDoc } from "./pieces"
import { filesWalkContentPieces } from "./utils"

export const METADATA_FILENAME = ".meta.json"

const defaultMetadata = {
  numSlides: 0,
  hasDoc: false,
}

export const readMetadata = async (diskpath: string): Promise<any> => {
  try {
    const metadataPath = join(diskpath, METADATA_FILENAME)
    const bytes = await readFile(metadataPath)
    const fileMetadata = JSON.parse(bytes.toString())
    return { ...defaultMetadata, ...fileMetadata }
  } catch (e) {
    console.warn(`Warning: error reading metadata for ${diskpath}: ${e}`)
    return {}
  }
}

const writeMetadata = async (dir: string, metadata: any) => {
  const json = JSON.stringify(metadata, null, 2)
  const metadataPath = join(dir, METADATA_FILENAME)
  await writeFile(metadataPath, json)
}

export const updateMetadata = async (diskpath: string, func: (metadata: any) => Promise<any>) => {
  const metadata = await readMetadata(diskpath)
  await func(metadata)
  await writeMetadata(diskpath, metadata)
}

type PieceStandardMetadata = {
  idjpath: string
  index: number
  numSlides: number
  hasDoc: boolean
}

export type MetadataLogFunc = (metadata: PieceStandardMetadata) => void

export const courseUpdateMetadata = async (courseIdpath: string[], logFunc?: MetadataLogFunc) => {
  let currPartIndex = 1
  let currSessionIndex = 1
  let chapterIndex = 1
  const allAnswers: Map<Hash, string[]> = new Map()

  await filesWalkContentPieces(courseIdpath, async ({ piece, diskpath }) => {
    const level = piece.idpath.length - 1 // 1-part, 2-session, 3-chapter

    // Collect answers for quiz questions
    const pieceAnswers: Map<Hash, string[]> = await collectAnswersForPiece(piece)
    pieceAnswers.forEach((values, key) => allAnswers.set(key, values))

    await updateMetadata(diskpath, async (metadata: any) => {
      // hasDoc
      metadata.hasDoc = await pieceHasDoc(piece)

      // numSlides
      const slideList = await getPieceSlideList(piece)
      metadata.numSlides = slideList.length

      // index
      if (level === 1) {
        metadata.index = currPartIndex
        currPartIndex++
      } else if (level === 2) {
        // index (for sessions), we assume that the walk is *ordered by filenames*
        metadata.index = currSessionIndex
        currSessionIndex++
        chapterIndex = 1
      } else {
        // walkContentPieces might set the index (the child index), so we copy it here.
        metadata.index = chapterIndex
        chapterIndex++
      }

      if (logFunc) {
        logFunc({ idjpath: piece.idpath.join("/"), ...metadata })
      }
    })
  })

  await writeAnswers(allAnswers)
}
