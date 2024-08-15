import { FileType } from "@/data/schema"
import { getAllAttachmentPaths } from "@/lib/data/files/backend"
import { hashAny } from "@/lib/data/hashing"

import { env } from "@/lib/env.mjs"
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { readFile } from "fs/promises"
import { extname, join } from "path"
import { fileTypeInfo, findoutDiskpathFromIdpath } from "../../lib/data/files/utils"
import mimeTypeTable from "../../lib/data/mime-types.json"

const mimeTypes: Record<string, string> = mimeTypeTable

type ImageUploaderOptions = {
  parallelRequests: number
}

class ImageUploader {
  parallelRequests: number
  s3client: S3Client

  constructor(options?: ImageUploaderOptions) {
    this.parallelRequests = options?.parallelRequests || 1
    this.s3client = new S3Client({
      region: env.R2_REGION,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      endpoint: env.R2_ENDPOINT,
      // logger: console,
    })
  }

  destroy() {
    this.client.destroy()
  }

  get client() {
    if (!this.s3client) {
      throw new Error(`S3 Client not initialized!?!?!`)
    }
    return this.s3client
  }

  async uploadImage(dirpath: string, filename: string, filetype: FileType, existing: Set<string>) {
    try {
      const { subdir } = fileTypeInfo[filetype]
      const filePath = join(dirpath, subdir, filename)
      const content = await readFile(filePath)
      const hash = hashAny(content)
      const ext = extname(filename)
      const imageKey = `${hash}${ext}`

      if (existing.has(imageKey)) {
        const space = " ".repeat(process.stdout.columns - imageKey.length - 1)
        process.stdout.write(`${imageKey}${space}\r`)
        return
      }

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: imageKey,
        Body: content,
        ACL: "public-read",
        ContentType: mimeTypes[ext],
      })

      await this.client.send(command)
      console.log(`${imageKey}`)

      return true
    } catch (err: any) {
      console.log(JSON.stringify(err))
      console.log(`Error! ${err}`)
      return false
    }
  }

  async uploadAllFilesOfType(filetype: FileType, existing: Set<string>) {
    const imagePaths = await getAllAttachmentPaths([env.COURSE_ID], filetype)

    const _uploadOne = async (index: number) => {
      const path = imagePaths[index]
      const idpath = path.slice(0, path.length - 1)
      const imageFilename = path.slice(-1)[0]
      const diskpath = await findoutDiskpathFromIdpath(idpath)
      if (diskpath === null) {
        throw new Error(`Diskpath not found for ${idpath.join("/")}`)
      }
      await this.uploadImage(diskpath, imageFilename, filetype, existing)
    }

    const _uploadAllWithOffset = async (offset: number) => {
      for (let i = offset; i < imagePaths.length; i += this.parallelRequests) {
        await _uploadOne(i)
      }
    }

    await Promise.allSettled(
      Array.from({ length: this.parallelRequests }).map((_, i) => {
        return _uploadAllWithOffset(i)
      })
    )

    // Erase last line if necessary
    const space = " ".repeat(process.stdout.columns - 1)
    process.stdout.write(`${space}\r`)
  }

  async listAllFiles() {
    process.stdout.write("Listing images")
    try {
      let isTruncated = true
      let contToken: string | undefined = undefined
      let fileList: { name: string; size: number }[] = []
      while (isTruncated) {
        process.stdout.write(".")
        const result: ListObjectsV2CommandOutput = await this.client.send(
          new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET,
            ContinuationToken: contToken,
            MaxKeys: 200,
          })
        )
        if (result.Contents) {
          for (const { Key: name, Size: size } of result.Contents) {
            if (name && size) {
              fileList.push({ name, size })
            }
          }
        }
        contToken = result.NextContinuationToken
        isTruncated = result.IsTruncated || false
      }
      process.stdout.write(`${fileList.length} images\n`)
      return fileList
    } catch (e) {
      console.error(`Error Listing Images:\n${e}`)
      return []
    }
  }
}

export const withImageUploader = async (
  options: ImageUploaderOptions,
  func: (uploader: ImageUploader) => Promise<void>
) => {
  const uploader = new ImageUploader(options)
  // await delay(1000);
  await func(uploader)
  uploader.destroy()
}
