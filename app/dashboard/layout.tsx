"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Home, Inbox, Blocks, Settings, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Support Tickets", href: "/dashboard/tickets", icon: Inbox, badge: "12" },
  { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to close the menu when a link is clicked on mobile
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    // Changed flex direction to support vertical stacking on mobile
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- Mobile Top Navigation Bar --- */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shrink-0 z-30 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-slate-800" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">clerk</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- Mobile Overlay Backdrop --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}
      
      {/* --- Sidebar --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-yellow-300 transition-colors shadow-sm">
              <Bot className="w-4 h-4 text-slate-800 group-hover:text-yellow-500 transition-colors" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">clerk</span>
          </Link>
          
          {/* Close Button for Mobile */}
          <button
            className="md:hidden p-1 text-slate-500 hover:text-slate-800 rounded-md focus:outline-none focus:bg-slate-100"
            onClick={closeMenu}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu} // Close drawer when navigating
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-yellow-50 text-yellow-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? "text-yellow-600" : "text-slate-400"}`} />
                  {item.name}
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-yellow-200 text-yellow-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section (User & Settings) */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex flex-col gap-1 mb-4">
            <Link 
              href="/dashboard/settings" 
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings
            </Link>
          </div>

          {/* User Profile Button */}
          <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Jane Doe</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">jane@company.com</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Adjusted padding on mobile slightly */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}