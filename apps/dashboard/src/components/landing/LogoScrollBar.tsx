"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function LogoScrollBar() {
  const brands = [
    { name: "Skims", logo: "/logos/skims.svg" },
    { name: "Glossier", logo: "/logos/glossier.svg" },
    { name: "Cettire", logo: "/logos/cettire.svg" },
    { name: "Warby Parker", logo: "/logos/warby-parker.svg" },
    { name: "Shopify", logo: "/logos/shopify.svg" },
  ];

  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="relative w-full py-12 md:py-16 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Sleek, understated header */}
        <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-10">
          <p className="text-[11px] font-extrabold tracking-widest uppercase text-slate-400">
            Powering the next generation of brands
          </p>
        </div>

        {/* Marquee Container with fade-out edges */}
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div
            className="flex items-center gap-16 sm:gap-24 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {duplicatedBrands.map((brand, i) => (
              <div 
                key={i} 
                className="flex items-center justify-center shrink-0 opacity-40 hover:opacity-60 transition-opacity grayscale"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className="object-contain h-6 sm:h-8 w-auto"
                />
              </div>
            ))}
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}