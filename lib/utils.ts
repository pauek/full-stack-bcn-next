import { FileType } from "@/data/schema"
import chalk from "chalk"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const range = (from: number, to: number) => {
  const result = []
  for (; from < to; from++) result.push(from)
  return result
}

export const base64ToBytes = (base64: string) => {
  const binString = Buffer.from(base64, "base64")
  return Uint8Array.from(binString)
}

export const base64ToString = (base64: string) => {
  const binString = Buffer.from(base64, "base64")
  const bytes = Uint8Array.from(binString)
  const buffer = Buffer.from(bytes)
  return buffer.toString("utf8")
}

export const stringToBase64 = (str: string) => {
  const buf = Buffer.from(str)
  return buf.toString("base64")
}

export const bytesToBase64 = (bytes: Uint8Array) => {
  const buf = Buffer.from(bytes)
  return buf.toString("base64")
}

export const lastElement = (array: Array<any>) => array[array.length - 1]

export const removeNullElements = <T>(array: (T | null)[]): T[] => {
  const result: T[] = []
  for (const element of array) {
    if (element) {
      result.push(element)
    }
  }
  return result
}

export const showExecutionTime = async <T>(func: () => Promise<T>, msg?: string) => {
  const start = Date.now()
  await func()
  const end = Date.now()
  console.log(chalk.yellow(`\n[${msg ? `${msg}: ` : ``}${(end - start) / 1000}s]`))
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const chunkArray = (array: Array<any>, chunkSize: number) => {
  const result = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}

// https://stackoverflow.com/questions/64928212/how-to-use-promise-allsettled-with-typescript
export const isFulfilled = function <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled"
}

type LogFileOptions = { preserve?: boolean; color?: boolean }

const logFile =
  (options?: LogFileOptions) => (filehash: string, filetype: FileType, filename: string) => {
    const { preserve = false, color = false } = options || {}

    const _hash = color ? chalk.gray(filehash) : filehash
    const _filetype = color ? chalk.green(filetype) : filetype
    const _filename = color ? chalk.yellow(filename) : filename

    const line = `  ${_hash} ${_filetype} ${_filename}`

    const nspaces = process.stdout.columns - 1 - line.length
    let space = ""
    if (nspaces > 0) {
      space = " ".repeat(nspaces)
    }
    process.stdout.write(`${line}${space}${preserve ? "\n" : "\r"}`)
  }

export const logUploadedFile = logFile({ preserve: true, color: true })
export const logPresentFile = logFile()

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const snap = (value: number, step: number): number => Math.round(value / step) * step

export const setUnion = <T>(a: Iterable<T>, b: Iterable<T>) => new Set([...a, ...b])

export const splitMarkdownPreamble = (text: string) => {
  const lines = text.split("\n")
  if (lines[0] === "---") {
    const preambleEnd = lines.indexOf("---", 1)
    if (preambleEnd !== -1) {
      const preamble = lines.slice(1, preambleEnd).join("\n")
      const body = lines.slice(preambleEnd + 1).join("\n")
      return { preamble, body }
    }
  }
  return { preamble: "", body: text }
}

export const getMetadataFromMarkdownPreamble = (preamble: string) => {
  const json = JSON.parse(preamble)
  if (typeof json !== "object") {
    throw new Error("Invalid JSON metadata: should be an object")
  }
  return json as Record<string, any>
}

export type Color = {
  r: number
  g: number
  b: number,
  a: number
}
export const interpolateColor = (a: Color, b: Color, t: number) => {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t
  }
}

export const colorToCSS = (color: Color) => {
  const { r, g, b, a } = color
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export const factorFromInterval = (value: number, low: number, high: number) => {
  if (value < low) {
    return 0
  } else if (value > high) {
    return 1
  } else {
    return (value - low) / (high - low)
  }
}
