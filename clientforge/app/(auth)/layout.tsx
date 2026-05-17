import Link from "next/link"
import { Zap } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="gradient-text">ClientForge</span>
      </Link>
      {children}
    </div>
  )
}
