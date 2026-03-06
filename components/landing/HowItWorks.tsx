import { Inbox, BrainCircuit, Send } from "lucide-react";

const steps = [
  {
    icon: Inbox,
    title: "Knows what your customers need",
    description:
      "It reads every incoming message and extracts the important details automatically. No copy-pasting or manual tagging needed.",
  },
  {
    icon: BrainCircuit,
    title: "Helps as tickets come in",
    description:
      "Summarizes context, suggests reply drafts, and flags urgent issues so your team stays ahead — not behind.",
  },
  {
    icon: Send,
    title: "Responds until it's resolved",
    description:
      "Drafts channel-native responses, sends them through the original platform, and follows up if needed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 bg-slate-50/80">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
          AI that helps you respond, not just read
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
          Your AI assistant understands context, drafts replies, and sends them — all from one place.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-start bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <blockquote className="text-lg sm:text-xl font-medium text-foreground italic">
            &quot;We cut our average response time from 4 hours to under 2 minutes. NexusDesk basically runs our support.&quot;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">Alex, E-commerce founder</p>
        </div>
      </div>
    </section>
  );
}
