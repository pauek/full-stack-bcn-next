"use server";

import { FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { readMetadata } from "@/lib/data/files/metadata";
import { readdir } from "fs/promises";
import { join } from "path";

type TabInfo = {
  order: number;
  name: string;
  slug: string;
};

/*
  
  This hack will show as session tabs the folders in the current
  directory, using as slug the name of the dir and taking the tab
  name from the .meta.json file.
  
  */

const anyChildHasAttachmentsOfType = async (piece: ContentPiece, filetype: FileTypeEnum) => {
  for (const child of piece.children || []) {
    const attachments = await data.getPieceAttachmentList(child, filetype);
    if (attachments.length > 0) {
      return true;
    }
  }
  return false;
};

export const getTabs = async (piece: ContentPiece) => {
  const options: TabInfo[] = [];
  const baseDir = "./app/c/[course]/[part]/[session]";
  for (const ent of await readdir(baseDir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      const metadata = await readMetadata(join(baseDir, ent.name));
      if (await anyChildHasAttachmentsOfType(piece, metadata.filetype)) {
        options.push({
          slug: ent.name,
          ...metadata,
        });
      }
    }
  }
  options.sort((a, b) => a.order - b.order);
  return options;
};
