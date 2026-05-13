import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="gradient-text">ClientForge</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              The client portal and project management SaaS built for agencies and freelancers.
            </p>
          </div>

          {[
            { heading: "Product", links: [["Features", "/#features"], ["Pricing", "/pricing"], ["Changelog", "/changelog"]] },
            { heading: "Company", links: [["About", "/about"], ["Blog", "/blog"], ["Careers", "/careers"]] },
            { heading: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"]] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-white font-semibold text-sm mb-3">{heading}</p>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 ClientForge. All rights reserved.</p>
          <p className="text-gray-600 text-sm">Made with ♥ for agencies everywhere</p>
        </div>
      </div>
    </footer>
  )
}
