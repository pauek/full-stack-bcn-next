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
