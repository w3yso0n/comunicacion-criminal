import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const intlEsMx = new Intl.NumberFormat("es-MX")

const intlCompactEsMx = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
})

export function formatIntegerEsMx(value: number): string {
  return intlEsMx.format(value)
}

export function formatCompactEsMx(value: number): string {
  return intlCompactEsMx.format(value)
}

export function initialsFromHandle(handle: string): string {
  const cleaned = handle.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "")
  if (cleaned.length === 0) return "?"
  if (cleaned.length === 1) return cleaned.toUpperCase()
  return (cleaned[0] + cleaned[1]).toUpperCase()
}
