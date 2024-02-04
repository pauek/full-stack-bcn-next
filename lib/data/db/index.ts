import { env } from "@/lib/env.mjs";
import { commonBackend } from "../common";
import { DataBackend, DataBackendBase } from "../data-backend";
import * as _backend from "./backend";

export * from "./backend";
export * from "./db";
export * from "./insert";
export * from "./utils";

const extractHost = (url: string) => {
  const match = url.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)\@([^\/]+)(\/.*)$/);
  if (!match) {
    return "";
  }
  const [_0, _1, _2, host, _4] = match;
  return host;
};

export const backend: DataBackendBase = {
  getInfo: () => `DB: ${extractHost(env.DB_URL)}`,
  ..._backend,
};

export const dbBackend: DataBackend = {
  ...backend,
  ...commonBackend,
};
