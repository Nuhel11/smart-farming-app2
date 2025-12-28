"use client"

import { ReactLenis } from "lenis/react"
import { ReactNode } from "react"

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.1,         // Speed of the "smoothness" (0.1 is standard)
      duration: 1.5,     // How long the scroll takes to settle
      smoothWheel: true 
    }}>
      {children}
    </ReactLenis>
  )
}