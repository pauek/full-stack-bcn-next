const _envVar = (variable: string) => {
  const value = process.env[variable]
  if (value === undefined) {
    throw new Error(`Missing ${variable} in environment`)
  }
  return value
}

// Outside t3-oss/env-nextjs:
export const CONTENT_ROOT = _envVar("CONTENT_ROOT")
