import Image from "next/image";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/shared/FadeIn"; // Import your new wrapper

export default function Hero() {
  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
      <Image
        src="/bg1.jpg"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="text-center text-white px-6">
        {/* Title Fades Up First */}
        <FadeIn direction="up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            We Build <span className="text-blue-400">Digital Excellence</span>
          </h1>
        </FadeIn>

        {/* Subtitle Fades Up with a small delay */}
        <FadeIn direction="up" delay={0.2}>
          <p className="mt-6 text-lg text-slate-200 max-w-2xl mx-auto">
            Custom Next.js solutions for forward-thinking businesses.
          </p>
        </FadeIn>

        {/* Buttons Fade Up last */}
        <FadeIn direction="up" delay={0.4}>
          <div className="mt-10 flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600">Get Started</Button>
            <Button size="lg" variant="outline" className="bg-blue-600">
              Our Work
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}