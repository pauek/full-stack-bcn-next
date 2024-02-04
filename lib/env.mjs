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
    // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
