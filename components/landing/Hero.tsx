import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smartphone, Settings2, Bot } from "lucide-react";
import Image from "next/image";
import HeroGraphic from "@/components/ui/heroGraphic"

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full pt-6 pb-10 md:pb-32 md:pt-10">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left side – Text */}
          <div className="flex flex-col gap-6 items-center lg:items-start">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl 2xl:text-5xl leading-[1.05] text-center lg:text-5xl lg:text-left">
              The only customer service employee you&apos;ll need.
            </h1>

            <p className="max-w-xl text-xl text-muted-foreground leading-relaxed text-center lg:text-left">
              Never miss a support ticket again. Respond to customers faster and
              automate tasks. Powered by agentic AI.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-md justify-center lg:justify-start font-bold">
              <span className="inline-flex items-center gap-1.5 text-yellow-400">
                <Smartphone className="size-4 text-yellow-400" /> Consolidate support channels
              </span>
              <span className="inline-flex items-center gap-1.5 text-yellow-400">
                <Settings2 className="size-4 text-yellow-400" /> Automate common requests
              </span>
              <span className="inline-flex items-center gap-1.5 text-yellow-400">
                <Bot className="size-4 text-yellow-400" /> Agent learns about your store
              </span>
            </div>

            <div className="hidden lg:flex items-center justify-center gap-4 mt-2">
              <Button
                size="lg"
                className="text-lg h-14 px-10 rounded-full"
                asChild
              >
                <Link href="/signup">Get started free</Link>
              </Button>

              <span className="-rotate-3 ml-4 hover:rotate-3 transition duration-300 ease-in-out">
                  <Image src="/images/no-credit-card-required.png" alt="No-credit-card-required" width={150} height={150} />
              </span>
            </div>
          </div>

          <HeroGraphic />

          {/* Mobile-only CTA below graphic */}
          <div className="flex lg:hidden items-center justify-center gap-4 mt-2">
            <Button
              size="lg"
              className="text-lg h-14 px-10 rounded-full"
              asChild
            >
              <Link href="/signup">Get started free</Link>
            </Button>

            <span className="-rotate-3 hover:rotate-3 transition duration-300 ease-in-out">
              <Image src="/images/no-credit-card-required.png" alt="No-credit-card-required" width={150} height={150} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}