import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    BACKEND: z.string(["files", "db"]),

    COURSE_ID: z.string(),
    CONTENT_ROOT: z.string(),
    COURSE_SUBDIR: z.string(),

    TURSO_URL: z.string().url(),
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

    TURSO_URL: process.env.TURSO_URL,
    TURSO_TOKEN: process.env.TURSO_TOKEN,
  },
  emptyStringAsUndefined: true,
})
