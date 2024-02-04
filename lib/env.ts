
const throwForVar = (name: string) => {
    throw new Error(`${name} not set`);
}

export const COURSE_ID = process.env.COURSE_ID || throwForVar("COURSE_ID");

export const DATABASE_URL = process.env.DATABASE_URL || throwForVar("DATABASE_URL");

export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || throwForVar("R2_PUBLIC_URL");
export const R2_REGION = process.env.R2_REGION || throwForVar("R2_REGION");
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || throwForVar("R2_ACCESS_KEY_ID");
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || throwForVar("R2_SECRET_ACCESS_KEY");
export const R2_ENDPOINT = process.env.R2_ENDPOINT || throwForVar("R2_ENDPOINT");
export const R2_BUCKET = process.env.R2_BUCKET || throwForVar("R2_BUCKET");
