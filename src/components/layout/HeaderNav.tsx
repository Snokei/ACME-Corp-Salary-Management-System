"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { CURRENT_USER, NAV_ITEMS } from "@/constants";
import { Bell, LogOut, User, Edit2, Check, X, Camera, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction, updateUserAction, getCurrentUserAction } from "@/actions/auth";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

export function HeaderNav() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Committed profile data - only changes after a successful save.
  // Drives the header display, avatar alt text and card heading.
  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    email: "admin@acme.com",
    role: CURRENT_USER.role
  });
  // Draft copy - bound to the edit form inputs so typing does not
  // immediately update the displayed profile data.
  const [draftData, setDraftData] = useState({
    name: CURRENT_USER.name,
    email: "admin@acme.com"
  });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserAction();
      if (user) {
        setProfileData(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
        }));
        setDraftData({
          name: user.name,
          email: user.email,
        });
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const startEditing = () => {
    // Seed the draft from the committed data so a cancelled edit is discarded.
    setDraftData({ name: profileData.name, email: profileData.email });
    setNewPassword("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftData({ name: profileData.name, email: profileData.email });
    setNewPassword("");
    setIsEditing(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login") {
    return null;
  }

  const handleSave = async () => {
    if (!draftData.name || !draftData.email) return;
    setIsSaving(true);
    
    const result = await updateUserAction(draftData.name, draftData.email, newPassword || undefined);
    setIsSaving(false);
    
    if (result.success) {
      // Commit the draft to the displayed profile data only after success.
      setProfileData(prev => ({
        ...prev,
        name: draftData.name,
        email: draftData.email,
      }));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setNewPassword("");
    } else {
      toast.error(result.error || "Failed to update profile settings.");
    }
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-0 relative z-50">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group shrink-0">
        <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold tracking-tight text-sm shadow-sm group-hover:opacity-90 transition-opacity whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="hidden sm:inline">ACME Salary Management System</span>
          <span className="sm:hidden">ACME</span>
        </div>
      </Link>

      {/* Center Floating Pill Navigation (Desktop) */}
      <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-white/70 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/70 dark:border-stone-800 shadow-sm transition-all">
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
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          title="Menu"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <button
          className="hidden sm:flex p-2 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative shrink-0"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
        </button>

        <ThemeToggle />

        {/* User Avatar Pill with Hover Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 shadow-sm cursor-pointer hover:border-amber-400/50 transition-colors">
            <img
              src={CURRENT_USER.avatar}
              alt={profileData.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/30"
            />
            {isLoading ? (
              <div className="hidden sm:block w-16 h-3 bg-stone-200/50 dark:bg-stone-700/50 animate-pulse rounded" />
            ) : (
              <span className="hidden sm:inline text-xs font-medium text-stone-800 dark:text-stone-200 max-w-[100px] truncate">
                {profileData.name}
              </span>
            )}
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
            <div className="p-1">
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-stone-800/80 rounded-xl transition-colors"
              >
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

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 p-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl rounded-2xl mx-1 flex flex-col gap-1.5 z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/30 dark:hover:text-amber-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <Modal isOpen={isProfileOpen} onClose={() => { setIsProfileOpen(false); cancelEditing(); }} maxWidth="sm">
        <div className="-mt-5 sm:-mt-6 -mx-5 sm:-mx-6 relative">
          {/* Banner */}
          <div className="h-28 sm:h-32 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 dark:from-stone-950 dark:via-stone-900 dark:to-black rounded-t-3xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:12px_12px]" />
            
            <button 
              onClick={() => { setIsProfileOpen(false); cancelEditing(); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar & Info */}
          <div className="px-4 sm:px-6 pb-6">
            <div className="relative flex justify-between items-end -mt-12 mb-4">
              <div className="relative">
                <img 
                  src={CURRENT_USER.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-stone-900 shadow-xl object-cover bg-stone-100" 
                />
                {isEditing && (
                  <button className="absolute bottom-1 right-1 p-1.5 sm:p-2 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                {!isEditing ? (
                  <button 
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 shadow-sm hover:bg-stone-50 dark:text-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-700 rounded-full transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={cancelEditing}
                      disabled={isSaving}
                      className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-full transition-all shadow-sm disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-xl text-stone-900 dark:text-white tracking-tight break-words">{profileData.name}</h3>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-500">{profileData.role}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={draftData.name}
                    onChange={(e) => setDraftData({...draftData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm font-semibold text-stone-900 dark:text-white outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="w-full min-w-0 px-4 py-2.5 bg-stone-50/50 dark:bg-stone-900/30 border border-transparent rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100 break-words">
                    {profileData.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={draftData.email}
                    onChange={(e) => setDraftData({...draftData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm font-semibold text-stone-900 dark:text-white outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="w-full min-w-0 px-4 py-2.5 bg-stone-50/50 dark:bg-stone-900/30 border border-transparent rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100 break-all">
                    {profileData.email}
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">Security</label>
                {isEditing ? (
                  <input 
                    type="password" 
                    placeholder="New password (leave blank to keep current)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm font-semibold text-stone-900 dark:text-white outline-none transition-all shadow-sm placeholder:text-stone-400 placeholder:font-normal"
                  />
                ) : (
                  <div className="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Password</span>
                      <span className="text-xs text-stone-500 tracking-widest mt-0.5">••••••••••••</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
