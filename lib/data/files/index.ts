import { commonBackend } from "../common";
import { DataBackend, DataBackendBase } from "../data-backend";
import * as _backend from "./backend";

export * from "./backend";
export * from "./hashes";
export * from "./metadata";
export * from "./utils";

export const backend: DataBackendBase = {
  getInfo: () => {
    return "<< FILES >>";
  },
  ..._backend,
};

export const filesBackend: DataBackend = {
  ...backend,
  ...commonBackend,
};
