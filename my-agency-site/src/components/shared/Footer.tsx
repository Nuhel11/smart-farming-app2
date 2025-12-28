"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-[#020617] border-t border-slate-900 pt-12 pb-8 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-bold text-xl tracking-tight text-white">
              N<span className="text-blue-600">UHEL</span>
            </Link>
            <p className="mt-4 text-slate-400 max-w-xs text-sm leading-relaxed">
              We help agencies and startups scale through high-performance 
              Next.js solutions and modern UI/UX design.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="#services" className="text-slate-400 hover:text-blue-500 text-sm transition-colors">Services</Link></li>
              <li><Link href="#portfolio" className="text-slate-400 hover:text-blue-500 text-sm transition-colors">Portfolio</Link></li>
              <li><Link href="#contact" className="text-slate-400 hover:text-blue-500 text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Socials */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs text-center md:text-left">
            © {new Date().getFullYear()} NUHEL. All rights reserved. 
            Built with Next.js 15.
          </p>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={scrollToTop}
            className="text-slate-400 hover:text-white hover:bg-slate-900 gap-2"
          >
            Back to top <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  )
}