
const throwForVar = (name: string) => {
    throw new Error(`${name} not set`);
}

export const CONTENT_ROOT = process.env.CONTENT_ROOT || throwForVar("CONTENT_ROOT");
export const COURSE_ID = process.env.COURSE_ID || throwForVar("COURSE_ID");
export const COURSE_SUBDIR = process.env.COURSE_SUBDIR || throwForVar("COURSE_SUBDIR");