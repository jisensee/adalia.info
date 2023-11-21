import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const radiusToSurfaceArea = (radiusMeters: number) =>
  (radiusMeters / 1_000) ** 2 * 4 * Math.PI
