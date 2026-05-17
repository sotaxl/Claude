import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: "blue" | "violet" | "green" | "red" | "gray"
}

const colorMap = {
  blue:   { bg: "bg-blue-500/10",   icon: "text-blue-400",   value: "text-blue-300" },
  violet: { bg: "bg-violet-500/10", icon: "text-violet-400", value: "text-violet-300" },
  green:  { bg: "bg-green-500/10",  icon: "text-green-400",  value: "text-green-300" },
  red:    { bg: "bg-red-500/10",    icon: "text-red-400",    value: "text-red-300" },
  gray:   { bg: "bg-gray-500/10",   icon: "text-gray-400",   value: "text-gray-300" },
}

export function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", c.bg)}>
        <Icon className={cn("w-5 h-5", c.icon)} />
      </div>
      <p className={cn("text-2xl font-bold", c.value)}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}
