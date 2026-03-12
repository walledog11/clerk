import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50/50 overflow-hidden px-4 font-sans">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-400/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Back to Home Navigation */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 
        <span className="hidden sm:inline">Back to website</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-yellow-300 transition-colors">
              <Bot className="w-6 h-6 text-slate-800 group-hover:text-yellow-500 transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">clerk</span>
          </Link>
        </div>

        {/* Login Card (Bento Style) */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Welcome back</h1>
            <p className="text-sm font-medium text-slate-500">Log in to your agent workspace</p>
          </div>

          <div className="space-y-5">
            
            {/* Social Login Button */}
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-full border-slate-200 font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-extrabold tracking-widest">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 ml-1 uppercase tracking-wider">Work Email</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">Forgot?</Link>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                />
              </div>
              
              <div className="pt-2">
                <Button className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm transition-all">
                  Log in to workspace
                </Button>
              </div>
            </form>

          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don&apos;t have an account? <Link href="/signup" className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors">Get started free</Link>
        </p>

      </div>
    </div>
  );
}