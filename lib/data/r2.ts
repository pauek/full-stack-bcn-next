import {
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

import { env } from "@/lib/env.mjs"

type R2FileInfo = { name: string; size: number }

export class R2Client {
  s3client: S3Client

  constructor() {
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
    this.s3client.destroy()
  }

  async uploadFile(key: string, content: Buffer, mimeType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: content,
        ACL: "public-read",
        ContentType: mimeType,
      })

      await this.s3client.send(command)
      console.log(`${key}`)
    } catch (e) {
      console.error(`CloudflareClient.uploadFile: ${e}`)
    }
  }

  async fileExists(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      })
      await this.s3client.send(command)
      return true
    } catch (e: any) {
      if (e.name !== "NotFound") {
        console.error(`CloudflareClient.fileExists: ${e}`)
      }
      return false
    }
  }

  async listFiles(): Promise<R2FileInfo[]> {
    try {
      let isTruncated = true
      let contToken: string | undefined = undefined
      let fileList: { name: string; size: number }[] = []
      while (isTruncated) {
        const result: ListObjectsV2CommandOutput = await this.s3client.send(
          new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET,
            ContinuationToken: contToken,
            MaxKeys: 200,
          }),
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
      return fileList
    } catch (e) {
      console.error(`Error Listing Images:\n${e}\n`)
      return []
    }
  }
}
