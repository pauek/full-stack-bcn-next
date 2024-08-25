/*

Sync
----

Ficheros --> Metadatos
Metadatos --> Base de Datos (repetidamente)

1. Primero hay que propagar los cambios que hay en los ficheros a los metadatos (.meta.json):
   - Cambios en contenido Markdown.
   - Ficheros nuevos: ejercicios, preguntas de test, slides, imágenes, etc.
   - Cambios en los propios metadatos, que también afectan al hash (posición, índice, nivel, id).
   Con los metadatos actualizados, se tienen los hashes de cada pieza de contenido.

   Este paso genera una lista de cosas que han cambiado, que se muestra por pantalla.

2. Se actualiza la base de datos usando el Merkle tree: desde arriba de todo, se mira si el hash existe.
   Si existe, se corta esa rama del proceso recursivo.
   Si no existe, hay que actualizar todas las tablas afectadas: pieces, hashmap, relaciones. 
   
   Luego hay que actualizar los attachments, incluyendo imágenes, que están en CloudFlare. 
   Para cada uno de estos, hay que mirar primero en la base de datos si las imágenes exiten ya. 
   Si no existen, hay que subirlas. Si existen no hay que hacer nada. Los attachments son 
   también como parte del Merkle tree.

   Y nunca se borra nada, solo se añade ("append only").

*/

import "@/lib/env-config"

import { FileType } from "@/data/schema"
import { ContentPiece, hash, pieceLevelFromChildren, setHash } from "@/lib/adt"
import { closeConnection } from "@/lib/data/db/db"
import { dbPieceHashExists, insertPiece, insertPieceHashmap } from "@/lib/data/db/insert"
import { getAllPieceAttachments } from "@/lib/data/files/attachments"
import { writeStoredHash } from "@/lib/data/files/hashes"
import {
  hashmapAdd,
  hashmapRemove,
  loadGlobalHashmap,
  writeGlobalHashmap,
} from "@/lib/data/files/hashmaps"
import { writeMetadata } from "@/lib/data/files/metadata"
import { filesGetRootIdpath, filesWalkContentPieces } from "@/lib/data/files/utils"
import { childrenHashes, hashPiece } from "@/lib/data/hashing"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"
import { insertFiles } from "./lib/lib"

const cliArgs = {
  forcedUpdate: false,
  dryRun: false,
}

/** Parse options */
const parseOption = (args: string[], long: string, short: string): boolean =>
  args.includes(long) || args.includes(short)

/**
 * Update a content piece in the database.
 * @param idpath The idpath of the piece.
 *
 * Also shows the hash and idpath of the piece on the screen.
 */
export const syncWithDatabase = async (tree: ContentPiece): Promise<number> => {
  let numChanges = 0
  
  // NOTE(pauek): Process 'hidden' pieces anyway. We will filter them out
  // at the last moment before showing them to the user.

  // Recursively update the Merkle tree, pruning branches that are already in the database.
  const _updatePiece = async (piece: ContentPiece) => {
    console.log(`${hash(piece)} ${piece.idpath.join("/")}`)
    await insertPiece(piece)
    await insertPieceHashmap(piece)
    await insertFiles(piece)
  }

  const _sync = async (piece: ContentPiece) => {
    // If this particular hash is already in the database, we don't need to do anything, since
    // the hash depends recuersively on all the children and attachments.
    if (await dbPieceHashExists(hash(piece))) {
      return
    }

    // Update children first (to avoid foreign key problems in `related_pieces`)
    if (piece.children) {
      for (const child of piece.children) {
        await _sync(child)
      }
    }

    // Insert the piece
    try {
      await _updatePiece(piece)
      numChanges++
    } catch (e) {
      console.error(`Error updating piece ${piece.idpath.join("/")}: ${e}`)
    }


  }

  await _sync(tree)

  return numChanges
}

/**
 * Walk the file tree and compute the new level, metadata, and hash.
 * The result is a memory datastructure of the _whole content tree_.
 */
export const syncFileTreeMetadata = async function (): Promise<{
  tree: ContentPiece
  numChanges: number
}> {
  let sessionIndex = 1
  let numChanges = 0

  // Load global hashmap before
  await loadGlobalHashmap()

  // WARNING: The pieces have to be walked in order of filename!
  // Otherwise, the indices will be wrong. (This is in principle
  // guaranteed by filesWalkContentPieces.)
  //
  const tree = await filesWalkContentPieces(
    filesGetRootIdpath(),
    async (diskpath, piece): Promise<ContentPiece> => {
      // Attachments
      const attachments = await getAllPieceAttachments(piece)
      const slideList = attachments.filter((a) => a.filetype === FileType.slide)
      const hasDoc = attachments.some((a) => a.filetype === FileType.doc)

      // Compute level
      let level = pieceLevelFromChildren(piece)

      // IMPORTANT: Updating metadata changes the hash!!
      // Update metadata fields (metadata was already read)
      const { metadata } = piece
      metadata.level = level
      metadata.hasDoc = hasDoc
      metadata.numSlides = slideList.length
      const depth = piece.idpath.length
      if (depth === 3) {
        metadata.index = sessionIndex++ // for sessions
      } else {
        metadata.index = piece.metadata.index
      }
      if (!cliArgs.dryRun) {
        await writeMetadata(diskpath, metadata)
      }

      // Compute new hash
      const oldHash = piece.hash
      const newHash = await hashPiece(piece, await childrenHashes(piece))

      if (!cliArgs.dryRun) {
        await writeStoredHash(diskpath, newHash)
        setHash(piece, newHash) // Replace it in memory as well
      }

      // Only if the hash has changed, or if we are uploading everything
      if (cliArgs.forcedUpdate || newHash !== oldHash) {
        hashmapRemove(oldHash)
        hashmapAdd({ hash: newHash, idpath: piece.idpath, diskpath, level })
        console.log(hash(piece), piece.idpath.join("/"))
        numChanges++
      }

      return piece
    }
  )

  // Write global hashmap after
  if (!cliArgs.dryRun) {
    await writeGlobalHashmap()
  }

  return { tree, numChanges }
}

// Main
showExecutionTime(async () => {
  const [_bun, _script, ...args] = process.argv
  cliArgs.dryRun = parseOption(args, "--dry-run", "-n")
  cliArgs.forcedUpdate = parseOption(args, "--force", "-f")

  if (cliArgs.dryRun) {
    console.log(chalk.bgYellow("DRY RUN: nothing will be written to disk."))
  }
  if (cliArgs.forcedUpdate) {
    console.log(chalk.bgYellow("FORCED UPDATE: all pieces will be processed."))
  }

  const { tree, numChanges: metadataChanges } = await syncFileTreeMetadata()

  if (metadataChanges === 0) {
    console.log(`No metadata changes.`)
  } else {
    console.log(`${metadataChanges} changed pieces.`)
  }
  console.log(tree.hash)
  
  if (cliArgs.dryRun) {
    console.log(chalk.bgYellow("DRY RUN: nothing was written to disk."))
  }

  const dbChanges = await syncWithDatabase(tree)
  if (dbChanges === 0) {
    console.log(`No database changes.`)
  } else {
    console.log(`${dbChanges} database changes.`)
  }

  await closeConnection()
})
