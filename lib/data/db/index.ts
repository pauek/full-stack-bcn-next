import { commonBackend } from "../common";
import { DataBackend, DataBackendBase } from "../data-backend";
import * as _backend from "./backend";

export * from "./backend";
export * from "./db";
export * from "./insert";
export * from "./utils";

export const backend: DataBackendBase = {
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
};

export const dbBackend: DataBackend = {
  ...backend,
  ...commonBackend,
};
