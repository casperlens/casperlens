import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContractData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatHash = (hash: string | undefined, start = 5, end = 5) => {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
};

export const hasVersions = (data: ContractData) => {
  return data.versions && data.versions.length > 0;
};

export const getUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user_id");
  }
  return null;
};
