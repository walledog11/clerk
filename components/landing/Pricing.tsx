import { Check } from "lucide-react";
import { Button } from "../ui/button";

const tiers = [
  {
    name: "Free",
    priceMonthly: "$0",
    description: "For new businesses just getting started.",
    features: [
      "Up to 50 conversations/month",
      "2 connected platforms",
      "Standard AI summaries",
      "Basic dashboard",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    priceMonthly: "$12",
    description: "Full access for growing businesses.",
    features: [
      "Unlimited conversations",
      "All platforms (TikTok, IG, Shopify, Email)",
      "Advanced AI summaries & drafts",
      "One-click AI responses",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    priceMonthly: "Custom",
    description: "For large teams with custom needs.",
    features: [
      "Custom integrations",
      "Dedicated account manager",
      "Custom AI training",
      "SOC2 / HIPAA compliance",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16 text-lg">
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                tier.popular
                  ? "border-foreground shadow-lg ring-1 ring-foreground"
                  : "border-slate-200"
              }`}
            >
              {tier.popular && (
                <span className="text-xs font-medium tracking-wider uppercase bg-foreground text-background w-fit px-3 py-1 rounded-full mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-foreground">{tier.priceMonthly}</span>
                {tier.priceMonthly !== "Custom" && (
                  <span className="ml-1 text-muted-foreground text-sm">/month</span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 rounded-full w-full ${
                  tier.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : ""
                }`}
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <a href="#">{tier.cta}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
