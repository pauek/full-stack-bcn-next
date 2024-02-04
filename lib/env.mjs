import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    COURSE_ID: z.string(),
    CONTENT_ROOT: z.string(),
    COURSE_SUBDIR: z.string(),

    DB_DATABASE: z.string(),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_PRISMA_URL: z.string().url(),
    DB_URL: z.string(),
    DB_URL_NON_POOLING: z.string(),

    R2_ACCESS_KEY_ID: z.string(),
    R2_BUCKET: z.string(),
    R2_ENDPOINT: z.string().url(),
    R2_PUBLIC_HOSTNAME: z.string(),
    R2_PUBLIC_URL: z.string().url(),
    R2_REGION: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
  },
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_DB_URL: z.string(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    COURSE_ID: process.env.COURSE_ID,
    CONTENT_ROOT: process.env.CONTENT_ROOT,
    COURSE_SUBDIR: process.env.COURSE_SUBDIR,

    DB_DATABASE: process.env.DB_DATABASE,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PRISMA_URL: process.env.DB_PRISMA_URL,
    DB_URL: process.env.DB_URL,
    DB_URL_NON_POOLING: process.env.DB_URL_NON_POOLING,
    NEXT_PUBLIC_DB_URL: process.env.NEXT_PUBLIC_DB_URL,

    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_HOSTNAME: process.env.R2_PUBLIC_HOSTNAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_REGION: process.env.R2_REGION,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  },
});
