
import './logobar.css'

export function LogoScrollBar() {
  const logos = [
    { name: "Shopify", src: "logos/shopify.svg" },
    { name: "Glossier", src: "logos/glossier.svg" },
    { name: "Skims", src: "logos/skims.svg" },
    { name: "Warby Parker", src: "logos/warby-parker.svg" },
    { name: "Cettire", src: "logos/cettire.svg" },
  ];

  return (
    <section className="relative z-10 w-full py-4 border-t border-b border-slate-100 overflow-hidden bg-white">
        
        <div className="logos">
            {[0, 1].map((i) => (
              <div className="logos-slide" key={i}>
                {logos.map((logo) => (
                  <img key={logo.name} src={logo.src} alt={logo.name} />
                ))}
              </div>
            ))}
        </div>
    </section>
  );
}