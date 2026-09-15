"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { CURRENT_USER, NAV_ITEMS } from "@/constants";
import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

export function HeaderNav() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-2">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold tracking-tight text-sm shadow-sm group-hover:opacity-90 transition-opacity">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>ACME Salary Management System</span>
        </div>
      </Link>

      {/* Center Floating Pill Navigation */}
      <nav className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/70 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/70 dark:border-stone-800 shadow-sm transition-all">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/30 dark:hover:text-amber-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2.5">
        <button
          className="p-2 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
        </button>

        <ThemeToggle />

        {/* User Avatar Pill with Hover Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 shadow-sm cursor-pointer hover:border-amber-400/50 transition-colors">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/30"
            />
            <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
              {CURRENT_USER.name}
            </span>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
            <div className="p-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-stone-800/80 rounded-xl transition-colors">
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <div className="h-px w-full bg-stone-200/50 dark:bg-stone-800/50 my-1"></div>
              <form action={logoutAction} className="w-full">
                <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
