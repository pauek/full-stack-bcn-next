import { env } from "@/lib/env.mjs";
import { commonBackend } from "../common";
import { DataBackend, DataBackendBase } from "../data-backend";
import * as _backend from "./backend";

export * from "./backend";
export * from "./db";
export * from "./utils";

export const backend: DataBackendBase = {
  getInfo: () => `DB: ${env.TURSO_URL}`,
  ..._backend,
};

export const dbBackend: DataBackend = {
  ...backend,
  ...commonBackend,
};
