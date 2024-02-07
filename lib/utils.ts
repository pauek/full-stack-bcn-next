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
  console.log(chalk.yellow(`\n[${msg ? `${msg}: ` : ``}${(end - start)/1000}s]`));
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chunkArray = (array: Array<any>, chunkSize: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// https://stackoverflow.com/questions/64928212/how-to-use-promise-allsettled-with-typescript
export const isFulfilled = function<T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> {
  return input.status === 'fulfilled';
}