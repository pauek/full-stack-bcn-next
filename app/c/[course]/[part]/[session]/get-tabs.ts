"use server";

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
export const getTabs = async () => {
  const options: TabInfo[] = [];
  const baseDir = "./app/c/[course]/[part]/[session]";
  for (const ent of await readdir(baseDir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      const metadata = await readMetadata(join(baseDir, ent.name));
      options.push({
        slug: ent.name,
        ...metadata,
      });
    }
  }
  options.sort((a, b) => a.order - b.order);
  return options;
};
