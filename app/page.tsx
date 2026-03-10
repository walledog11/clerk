
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BuiltFor } from "@/components/landing/BuiltFor";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LogoScrollBar } from "@/components/ui/LogoScrollBar";
import { WorkSprawl } from "@/components/landing/WorkSprawl";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      <DotPattern
        width={26}
        height={26}
        cr={1}
        className="absolute inset-0 z-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_85%)]"
      />
      <Navbar />
      <Hero />
      <LogoScrollBar />
      <WorkSprawl />
      <Features />
      <HowItWorks />
      <BuiltFor />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
