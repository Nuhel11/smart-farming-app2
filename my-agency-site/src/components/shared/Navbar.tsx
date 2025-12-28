"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Brand Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
          N<span className="text-blue-600">UHEL</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="#services" className={navigationMenuTriggerStyle()}>
                Services
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#portfolio" className={navigationMenuTriggerStyle()}>
                Portfolio
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          {/* Desktop Call to Action */}
          <Button variant="default" className="hidden md:inline-flex" asChild>
            <Link href="#contact">Get a Quote</Link>
          </Button>

          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="#services" className="text-lg font-medium">Services</Link>
                  <Link href="#portfolio" className="text-lg font-medium">Portfolio</Link>
                  <Button asChild className="w-full">
                    <Link href="#contact">Get a Quote</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}