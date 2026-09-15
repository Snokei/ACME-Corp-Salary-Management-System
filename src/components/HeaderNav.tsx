"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { CURRENT_USER, NAV_ITEMS } from "@/constants";
import { Bell, Search } from "lucide-react";

export function HeaderNav() {
  const pathname = usePathname();

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
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800/60"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-500 shadow-sm">
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none w-28 placeholder:text-stone-400 text-stone-700 dark:text-stone-200 text-xs"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-400">
            ⌘K
          </kbd>
        </div>

        <button
          className="p-2 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
        </button>

        <ThemeToggle />

        {/* User Avatar Pill */}
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
      </div>
    </header>
  );
}

