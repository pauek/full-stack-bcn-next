/*

- Development mode is BACKEND="files", really. 
  That is, don't touch any database, write files only (to have a repo of those files)

- Production mode is typically BACKEND="db", but then the DB can be "development", 
  "preview", or "production". App uses the corresponding database, also for the build.

*/

import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    COURSE_ID: z.string(),
    BACKEND: z.string(["files", "db"]),

    TURSO_URL: z.string(),
    TURSO_TOKEN: z.string(),

    R2_ACCESS_KEY_ID: z.string(),
    R2_BUCKET: z.string(),
    R2_ENDPOINT: z.string().url(),
    R2_PUBLIC_HOSTNAME: z.string(),
    R2_PUBLIC_URL: z.string().url(),
    R2_REGION: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
  },
  runtimeEnv: {
    COURSE_ID: process.env.COURSE_ID,
    BACKEND: process.env.BACKEND,

    TURSO_URL: process.env.TURSO_URL,
    TURSO_TOKEN: process.env.TURSO_TOKEN,

    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_HOSTNAME: process.env.R2_PUBLIC_HOSTNAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_REGION: process.env.R2_REGION,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  },
  emptyStringAsUndefined: true,
})

const _envVar = (variable) => {
  const value = process.env[variable]
  if (value === undefined) {
    throw new Error(`Missing ${variable} in environment`)
  }
  return value
}

// Outside t3-oss/env-nextjs:
export const CONTENT_ROOT = _envVar("CONTENT_ROOT")
