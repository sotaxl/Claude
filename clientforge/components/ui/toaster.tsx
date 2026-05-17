"use client"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur animate-fade-in ${
            variant === "destructive"
              ? "border-red-500/30 bg-red-950/80 text-red-200"
              : "border-white/10 bg-gray-900/90 text-white"
          }`}
        >
          <div className="flex-1">
            {title && <p className="text-sm font-medium">{title}</p>}
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
          </div>
          <button onClick={() => dismiss(id)} className="text-gray-500 hover:text-gray-300 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
