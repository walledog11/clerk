import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { DotPattern } from "../ui/dot-pattern";

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full bg-background pt-24 pb-32">
      {/* Dot pattern behind everything, fading out toward edges */}
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="absolute inset-0 z-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_90%)]"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Respond faster, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
               smarter, and easier.
            </span>
          </h1>
          
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Consolidate messages from TikTok, Instagram, Shopify, and Email. Let AI summarize tickets and draft identical replies across all your channels in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8" asChild>
              <Link href="/signup">Try for free</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}