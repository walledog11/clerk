"use client";

import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function SignUpPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden px-4 py-12 font-sans">
      
      {/* 1. Dot Pattern Background */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1}
        className="opacity-40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        glow={true}
      />

      {/* 2. Subtle Background Glow (Matched from Hero) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 pointer-events-none blur-[100px] bg-gradient-to-b from-yellow-400 to-transparent z-0" />

      {/* Back to Home Navigation */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" /> 
        <span className="hidden sm:inline">Back to website</span>
      </Link>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* 3. Floating Sticky Note 1 (Yellow) */}
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [6, 8, 6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-8 -right-4 sm:-top-12 sm:-right-20 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-200 shadow-lg flex items-center justify-center p-3 z-0"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-yellow-400/30 -mt-1 shadow-sm mix-blend-multiply" />
          <span className="text-yellow-950 text-sm sm:text-lg leading-tight text-center rotate-[-2deg] font-bold">
            Get back to inbox zero!
          </span>
        </motion.div>

        {/* 4. Floating Sticky Note 2 (Blue) */}
        <motion.div
          animate={{ y: [5, -5, 5], rotate: [-8, -6, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-8 -left-4 sm:-bottom-10 sm:-left-16 w-20 h-20 sm:w-28 sm:h-28 bg-blue-200 shadow-lg flex items-center justify-center p-3 z-0"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-blue-400/30 -mt-1 shadow-sm mix-blend-multiply" />
          <span className="text-blue-950 text-xs sm:text-base leading-tight text-center rotate-[2deg] font-bold">
            No more sprawl.
          </span>
        </motion.div>

        {/* Brand Logo Header */}
        <div className="relative flex justify-center mb-8 z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-yellow-300 transition-colors">
              <Bot className="w-6 h-6 text-slate-800 group-hover:text-yellow-500 transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">clerk</span>
          </Link>
        </div>

        {/* Sign Up Card (Bento Style with Glassmorphism) */}
        <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Create your account</h1>
            <p className="text-sm font-medium text-slate-500">Join Clerk and automate your support today</p>
          </div>

          <div className="space-y-5">
            
            {/* Social Sign Up Button */}
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-full border-slate-200 font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all bg-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/80 backdrop-blur-md px-3 text-slate-400 font-extrabold tracking-widest rounded-full">Or sign up with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              
              {/* Name Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 ml-1 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane" 
                    className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 ml-1 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 ml-1 uppercase tracking-wider">Work Email</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 ml-1 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  placeholder="Create a strong password" 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                />
              </div>
              
              <div className="pt-3">
                <Button className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm transition-all">
                  Create account
                </Button>
              </div>

              {/* TOS Agreement */}
              <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed px-2 font-medium">
                By creating an account, you agree to our{" "}
                <Link href="#" className="underline hover:text-slate-800 transition-colors">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="underline hover:text-slate-800 transition-colors">Privacy Policy</Link>.
              </p>
            </form>

          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500 mt-8 font-medium relative z-10">
          Already have an account? <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors">Log in</Link>
        </p>

      </div>
    </div>
  );
}