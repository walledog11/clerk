import { Star } from "lucide-react";

const audiences = [
  {
    title: "For DTC brands",
    description:
      "Consolidate Instagram, TikTok, and Shopify messages. When a customer reaches out, AI breaks it down and drafts the perfect reply instantly.",
  },
  {
    title: "For small businesses",
    description:
      "Stop losing sales to slow responses. Let AI handle the repetitive tickets while you focus on growth and product.",
  },
  {
    title: "For support teams",
    description:
      "Give your agents superpowers. AI pre-summarizes every ticket and suggests responses so your team resolves issues 10x faster.",
  },
];

export function BuiltFor() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-16">
          Built for how you work
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {audiences.map((a, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-16 max-w-2xl mx-auto bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
          <blockquote className="text-lg font-medium text-foreground italic">
            &quot;I used to juggle four different tabs for customer messages. Now everything stays in one place.&quot;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">Priya, Shopify store owner</p>
        </div>
      </div>
    </section>
  );
}
