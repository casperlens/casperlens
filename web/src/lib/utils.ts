import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatHash = (hash: string, length = 12) => {
	if (!hash) return "";
	if (hash.length <= length) return hash;
	return `${hash.slice(0, length / 2)}...${hash.slice(-length / 2)}`;
};
