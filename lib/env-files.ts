const _envVar = (variable: string) => {
  const value = process.env[variable]
  if (value === undefined && process.env.BACKEND === "files") {
    throw new Error(`Environment variable ${variable} is required in files mode.`)
  }
  return value
}

// Outside t3-oss/env-nextjs:
export const getContentRoot = () => _envVar("CONTENT_ROOT") || "."
