import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smartphone, Settings2, Bot } from "lucide-react";
import { DotPattern } from "../ui/dot-pattern";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full bg-background pt-24 pb-20 md:pb-32">
      {/* Dot pattern behind everything, fading out toward edges */}
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="absolute inset-0 z-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_90%)]"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left side – Text */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.05]">
              The only customer service employee you&apos;ll need.
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              Never miss a support ticket again. Respond to customers faster and
              automate tasks. Powered by agentic AI.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="size-4" /> Consolidate support channels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Settings2 className="size-4" /> Automate common requests
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bot className="size-4" /> Agent learns about your store
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <Button
                size="lg"
                className="text-lg h-14 px-10 rounded-full"
                asChild
              >
                <Link href="/signup">Get started free</Link>
              </Button>
              <span className="flex items-start gap-1">
                {/* Arrow */}
                <svg
                  width="48"
                  height="44"
                  viewBox="0 0 48 44"
                  fill="none"
                  className="shrink-0 mt-1"
                >
                  <path
                    d="M44 4C38 8 28 16 18 24C14 27 10 30 8 32"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 24L7 32L16 30"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Handwritten text */}
                <span className="font-handwriting text-xl leading-tight text-foreground -rotate-3">
                  no credit<br />card required
                </span>
              </span>
            </div>
          </div>

          {/* Right side – Platform icons */}
          <div className="relative flex items-center justify-center min-h-[340px] md:min-h-[420px]">
            {/* Central bot icon */}
            <div className="relative z-10 size-36 md:size-44 rounded-3xl border-4 border-yellow-400 bg-white flex items-center justify-center shadow-lg">
              <Bot className="text-yellow-400 size-20"/>
            </div>

            {/* Gmail */}
            <div className="absolute top-4 left-[20%] size-14 md:size-16 rounded-xl bg-white shadow-md flex items-center justify-center">
              <Image src="/logos/gmail.png" width={100} height={100} alt="gmail-logo"/>
            </div>

            {/* Shopify */}
            <div className="absolute top-2 right-[12%] size-14 md:size-16 rounded-xl bg-[#96bf48] shadow-md flex items-center justify-center">
              <Image src="/logos/shopify-inbox.png" width={100} height={100} alt="shopify-inbox-logo"/>
            </div>

            {/* Instagram */}
            <div className="absolute bottom-8 left-[18%] size-14 md:size-16 rounded-xl shadow-md flex items-center justify-center overflow-hidden">
              <Image src="/logos/instagram-logo.png" width={100} height={100} alt="instagram-logo"/>
            </div>

            {/* TikTok */}
            <div className="absolute bottom-4 right-[10%] size-14 md:size-16 rounded-xl bg-black shadow-md flex items-center justify-center">
              <Image src="/logos/tiktok-logo.png" width={100} height={100} alt="tiktok-logo"/>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}