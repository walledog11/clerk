import Image from "next/image";

export function LogoBar() {
  const logos = [
    { name: "Shopify", src: "logos/shopify.svg" },
    { name: "Glossier", src: "logos/glossier.svg" },
    { name: "Skims", src: "logos/skims.svg" },
    { name: "Warby Parker", src: "logos/warby-parker.svg" },
    { name: "Cettire", src: "logos/cettire.svg" },
  ];

  return (
    <section className="w-full py-5 border-t border-b border-slate-100 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center gap-10 md:gap-16 flex-nowrap overflow-x-auto">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center justify-center w-[140px] h-[80px] shrink-0">
              <Image
                src={logo.src}
                alt={logo.name}
                width={140}
                height={48}
                className="max-h-[40px] max-w-[140px] w-auto h-auto object-contain grayscale opacity-40 hover:opacity-70 hover:grayscale-0 hover:fill-green-300 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
