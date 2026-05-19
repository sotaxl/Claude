import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(amount));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const TRADE_CATEGORIES = [
  { value: "electrician", label: "Electrician", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { value: "plumber", label: "Plumber", icon: "🔧", color: "bg-blue-100 text-blue-800" },
  { value: "carpenter", label: "Carpenter", icon: "🪚", color: "bg-amber-100 text-amber-800" },
  { value: "roofer", label: "Roofer", icon: "🏠", color: "bg-red-100 text-red-800" },
  { value: "painter", label: "Painter & Decorator", icon: "🎨", color: "bg-purple-100 text-purple-800" },
  { value: "hvac", label: "HVAC Engineer", icon: "❄️", color: "bg-cyan-100 text-cyan-800" },
  { value: "landscaper", label: "Landscaper", icon: "🌿", color: "bg-green-100 text-green-800" },
  { value: "tiler", label: "Tiler", icon: "🔲", color: "bg-slate-100 text-slate-800" },
  { value: "builder", label: "Builder", icon: "🏗️", color: "bg-orange-100 text-orange-800" },
  { value: "plasterer", label: "Plasterer", icon: "🪣", color: "bg-stone-100 text-stone-800" },
  { value: "locksmith", label: "Locksmith", icon: "🔑", color: "bg-zinc-100 text-zinc-800" },
  { value: "handyman", label: "Handyman", icon: "🛠️", color: "bg-teal-100 text-teal-800" },
] as const;

export type TradeType = typeof TRADE_CATEGORIES[number]["value"];

export function getTradeCategory(value: string) {
  return TRADE_CATEGORIES.find((c) => c.value === value);
}
