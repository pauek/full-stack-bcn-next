import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/*

- Development mode is BACKEND="files", really. 
  That is, don't touch any database.

- Production mode is BACKEND="db", but then the DB can be "development", "preview", or "production".
  Here the app uses the corresponding database, for building too. 

*/

const tursoToken = (DB, env) => {
  switch (DB) {
    case "preview":
      return env.TURSO_TOKEN_PREVIEW
    case "production":
      return env.TURSO_TOKEN_PRODUCTION
    default:
    case "development":
      return env.TURSO_TOKEN
  }
}

const tursoUrl = (DB, env) => {
  switch (DB) {
    case "preview":
      return env.TURSO_URL_PREVIEW
    case "production":
      return env.TURSO_URL_PRODUCTION
    default:
    case "development":
      return env.TURSO_URL
  }
}

export const env = createEnv({
  server: {
    BACKEND: z.string(["files", "db"]),

    COURSE_ID: z.string(),
    CONTENT_ROOT: z.string(),
    COURSE_SUBDIR: z.string(),

    DB: z.enum(["development", "preview", "production"]).optional(),

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
    BACKEND: process.env.BACKEND,

    DB: process.env.DB,

    COURSE_ID: process.env.COURSE_ID,
    CONTENT_ROOT: process.env.CONTENT_ROOT,
    COURSE_SUBDIR: process.env.COURSE_SUBDIR,

    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_HOSTNAME: process.env.R2_PUBLIC_HOSTNAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_REGION: process.env.R2_REGION,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,

    TURSO_TOKEN: tursoToken(process.env.DB, process.env),
    TURSO_URL: tursoUrl(process.env.DB, process.env),
  },
  emptyStringAsUndefined: true,
})
