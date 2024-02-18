import { FileType } from "@/data/schema";
import chalk from "chalk";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const range = (from: number, to: number) => {
  const result = [];
  for (; from < to; from++) result.push(from);
  return result;
};

export const base64ToBytes = (base64: string) => {
  const binString = Buffer.from(base64, "base64");
  return Uint8Array.from(binString);
};

export const bytesToBase64 = (bytes: Uint8Array) => {
  const buf = Buffer.from(bytes);
  return buf.toString("base64");
};

export const lastItem = (array: Array<any>) => array[array.length - 1];

export const removeNullElements = <T>(array: (T | null)[]): T[] => {
  const result: T[] = [];
  for (const element of array) {
    if (element) {
      result.push(element);
    }
  }
  return result;
};

export const showExecutionTime = async <T>(func: () => Promise<T>, msg?: string) => {
  const start = Date.now();
  await func();
  const end = Date.now();
  console.log(chalk.yellow(`\n[${msg ? `${msg}: ` : ``}${(end - start) / 1000}s]`));
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chunkArray = (array: Array<any>, chunkSize: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

// https://stackoverflow.com/questions/64928212/how-to-use-promise-allsettled-with-typescript
export const isFulfilled = function <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> {
  return input.status === "fulfilled";
};

type LogFileOptions = { preserve?: boolean; color?: boolean };

const logFile =
  (options?: LogFileOptions) => (hash: string, filetype: FileType, filename: string) => {
    const { preserve = false, color = false } = options || {};

    const _hash = color ? chalk.gray(hash) : hash;
    const _filetype = color ? chalk.green(filetype) : filetype;
    const _filename = color ? chalk.yellow(filename) : filename;

    const line = `  ${_hash} ${_filetype} ${_filename}`;
    const space = " ".repeat(process.stdout.columns - 1 - line.length);

    process.stdout.write(`${line}${space}${preserve ? "\n" : "\r"}`);
  };

export const logUploadedFile = logFile({ preserve: true, color: true });
export const logPresentFile = logFile();

export const splitMarkdownPreamble = (text: string) => {
  const lines = text.split("\n");
  if (lines[0] === "---") {
    const preambleEnd = lines.indexOf("---", 1);
    if (preambleEnd !== -1) {
      const preamble = lines.slice(1, preambleEnd).join("\n");
      const body = lines.slice(preambleEnd + 1).join("\n");
      return { preamble, body };
    }
  }
  return { preamble: "", body: text };
};

export const getQuizPartsFromFile = (text: string) => {
  const { preamble, body } = splitMarkdownPreamble(text);
  if (!preamble) {
    throw new Error("Question missing preamble");
  }
  const { answer } = JSON.parse(preamble);
  if (!answer) {
    throw new Error("Question missing answer");
  }
  return { answer, body };
}
