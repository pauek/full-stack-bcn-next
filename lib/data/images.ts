import { FileTypeEnum } from "@/data/schema";
import data from "@/lib/data";
import { fileTypeInfo } from "@/lib/data/files";
import { hashAny } from "@/lib/data/hashing";
import {
  COURSE_ID,
  R2_ACCESS_KEY_ID,
  R2_BUCKET,
  R2_ENDPOINT,
  R2_REGION,
  R2_SECRET_ACCESS_KEY,
} from "@/lib/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { mimeTypes } from "../mime-types";

const s3 = new S3Client({
  region: R2_REGION,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  endpoint: R2_ENDPOINT,
});

const uploadImage = async (dirpath: string, filename: string, filetype: FileTypeEnum) => {
  try {
    const { subdir } = fileTypeInfo[filetype];
    const filePath = join(dirpath, subdir, filename);
    const content = await readFile(filePath);
    const hash = hashAny(content);
    const ext = extname(filename);
    const imageKey = `${hash}${ext}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: imageKey,
      Body: content,
      ACL: "public-read",
      ContentType: mimeTypes[ext],
    });

    await s3.send(command);
    console.log(`${hash} ${filePath}`);

    return true;
  } catch (err) {
    console.log(`Error! ${err}`);
    return false;
  }
};

export const uploadAllFilesOfType = async (
  filetype: FileTypeEnum,
  parallelRequests: number = 50
) => {
  const imagePaths = await data.getAllAttachmentPaths([COURSE_ID], filetype);

  const _uploadOne = async (index: number) => {
    const path = imagePaths[index];
    const idpath = path.slice(0, path.length - 1);
    const imageFilename = path.slice(-1)[0];
    const piece = await data.getPiece(idpath);
    if (!piece) {
      throw new Error(`Piece not found: ${idpath}`);
    }
    await uploadImage(piece.diskpath, imageFilename, filetype);
  };

  const _uploadAllWithOffset = async (offset: number) => {
    for (let i = offset; i < imagePaths.length; i += parallelRequests) {
      await _uploadOne(i);
    }
  };

  await Promise.allSettled(
    Array.from({ length: parallelRequests }).map((_, i) => {
      return _uploadAllWithOffset(i);
    })
  );
};
