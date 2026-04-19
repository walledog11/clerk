import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { LiveDemo } from "./_components/LiveDemo";
import { StatsTicker } from "./_components/StatsTicker";
import { Channels } from "./_components/Channels";
import { Workflow } from "./_components/Workflow";
import { Pricing } from "./_components/Pricing";
import { FAQ } from "./_components/FAQ";
import { CTA } from "./_components/CTA";
import { Footer } from "./_components/Footer";
import NotificationBar from "./_components/NotificationBar";

export default function Home() {
  return (
    <main>
      <NotificationBar />
      <Navbar />
      <Hero />
      <LiveDemo />
      <StatsTicker />
      <Channels />
      <Workflow />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
