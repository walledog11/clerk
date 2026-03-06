import Link from "next/link";
import { Button } from "../ui/button";
import { Bot } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full flex justify-center pt-4 px-4">
      <nav className="w-full max-w-5xl rounded-full border backdrop-blur-lg bg-white/30 shadow-sm px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Bot />
            <span className="text-xl font-bold text-green-300">clerk</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:block">
            Sign In
          </Link>
          <Button className="rounded-full" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}