import Link from "next/link";
import { Wrench, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  "Find Work": [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Create Trade Profile", href: "/register?role=tradesperson" },
    { label: "Pricing for Pros", href: "/pricing" },
    { label: "Pro Dashboard", href: "/dashboard" },
  ],
  "Hire a Pro": [
    { label: "Find Tradespeople", href: "/browse" },
    { label: "Post a Job", href: "/post-job" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Verified Pros", href: "/browse?verified=true" },
  ],
  Company: [
    { label: "About TradesLink", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "Help Centre", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Safety Guide", href: "/safety" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Trades<span className="text-brand-400">Link</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting homeowners with trusted local tradespeople across the UK.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold text-white text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TradesLink Ltd. All rights reserved. Registered in England & Wales.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="text-xs text-slate-500 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
