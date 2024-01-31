import { sql } from "drizzle-orm";
import { getBreadcrumbData } from "../common";
import { DataBackend } from "../data-backend";
import * as _backend from "./backend";
import { getPieceWithChildren } from "./backend";
import { db } from "./db";

export * from "./backend";
export * from "./insert";
export * from "./db";
export * from "./utils";

export const backend: DataBackend = {
  getInfo: () => {
    const DATABASE_URL = process.env.DATABASE_URL!;
    const match = DATABASE_URL.match(/^postgresql:\/\/([^:]+):([^@]+)\@([^\/]+)(\/.*)$/);
    if (!match) {
      return `Database ${DATABASE_URL}`;
    }
    const [_, _username, _password, host, _database] = match;
    return `DB: ${host}`;
  },
  ..._backend,
  getBreadcrumbData: getBreadcrumbData(getPieceWithChildren),
};
