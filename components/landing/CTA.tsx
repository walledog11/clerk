import { Button } from "../ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative z-10 w-full py-24">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Your customers deserve faster answers
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
          No matter what you sell, NexusDesk is where all your support comes together.
        </p>
        <Button className="rounded-full px-8 py-6 text-base font-medium bg-foreground text-background hover:bg-foreground/90" asChild>
          <Link href="/signup">Try for free</Link>
        </Button>
      </div>
    </section>
  );
}
