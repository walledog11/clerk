"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const tiers = [
  {
    name: "Starter",
    priceMonthly: 14.95,
    priceAnnually: 9.95,
    seats: "up to 10 seats",
    description:
      "Essential capabilities to get started with single-channel support",
    featuresLabel: "KEY FEATURES INCLUDE",
    features: [
      "Shared inbox and ticketing",
      "AI Topics and up to 10 automation rules",
      "Basic analytics",
      "No-code public knowledge base",
      "Available AI add-ons: Copilot, QA, CSAT",
    ],
    cta: "Try for Free",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Professional",
    priceMonthly: 39.95,
    priceAnnually: 29.95,
    seats: "up to 50 seats",
    description:
      "Enhanced automation and reporting for omnichannel support",
    featuresLabel: "EVERYTHING IN STARTER, PLUS",
    features: [
      "Omnichannel (email, SMS, social, etc.)",
      "Macros and up to 20 automation rules",
      "Advanced analytics",
      "Multiple workspaces, SSO, and SCIM",
      "AI Autopilot add-on",
    ],
    cta: "Request a Demo",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    priceMonthly: 105,
    priceAnnually: 80,
    seats: null,
    description:
      "Advanced AI tools to accelerate resolution and elevate CX",
    featuresLabel: "EVERYTHING IN PROFESSIONAL, PLUS",
    features: [
      "Smart rules",
      "Unlimited rules and macros",
      "Multi-language knowledge base",
      "Custom roles and permissions",
      "AI Copilot, QA, and CSAT included",
    ],
    cta: "Request a Demo",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative z-10 w-full py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top area: heading left, cards right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-7xl mx-auto items-start">
          {/* Left column */}
          <div className="lg:w-[300px] shrink-0 flex flex-col gap-6 ">
            <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              Pricing Plans
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Build the best CX
            </h2>
            <p className="text-muted-foreground text-base">
              Plans for startups, enterprises, and everything in between.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  annual ? "bg-purple-500" : "bg-gray-300"
                }`}
                aria-label="Toggle annual billing"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    annual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-foreground">
                Billed Annually
              </span>
              {annual && (
                <span className="bg-[#d4f53f] text-foreground text-xs font-bold px-2 py-0.5 rounded-sm uppercase">
                  Save 24%
                </span>
              )}
            </div>
          </div>

          {/* Right column — cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1">
            {tiers.map((tier) => {
              const price = annual ? tier.priceAnnually : tier.priceMonthly;

              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                    tier.popular
                      ? "border-yellow-300 shadow-yellow-300 ring-2 ring-yellow-300"
                      : "border-slate-200"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">
                      {tier.name}
                    </h3>
                    {tier.popular && (
                      <Badge className="bg-[#d4f53f] text-foreground border-none text-[10px] font-bold uppercase tracking-wide hover:bg-[#d4f53f]">
                        Most Popular
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-0.5">
                    <span className="text-4xl font-bold text-foreground">
                      ${price}</span> <span className="text-sm font-semibold text-muted-foreground">/mo</span>
                  </div>

                  {/* Divider */}
                  <hr className="my-5 border-slate-200" />

                  {/* Description */}
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {tier.description}
                  </p>

                  {/* Features label */}
                  <p className="mt-5 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                    {tier.featuresLabel}
                  </p>

                  {/* Features */}
                  <ul className="mt-4 space-y-3 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={`mt-8 rounded-full w-full h-12 text-sm font-semibold ${
                      tier.ctaVariant === "default"
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                    }`}
                    variant={tier.ctaVariant}
                    asChild
                  >
                    <a href="#">{tier.cta}</a>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
