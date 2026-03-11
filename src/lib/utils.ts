import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined, decimals = 0): string {
  if (n == null) return '—';
  return n.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function getStatoColor(stato: string): string {
  const map: Record<string, string> = {
    pianificato: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    in_corso: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    completato: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    sospeso: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };
  return map[stato] || '';
}

export function calcolaSemaforo(effettivo: number, previsto: number): 'verde' | 'giallo' | 'rosso' {
  if (previsto === 0) return 'verde';
  const ratio = effettivo / previsto;
  if (ratio >= 0.8) return 'verde';
  if (ratio >= 0.5) return 'giallo';
  return 'rosso';
}
