import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { wallClockDateBr } from "@/lib/wall-clock-datetime"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(date: string) {
  return wallClockDateBr(date);
}
