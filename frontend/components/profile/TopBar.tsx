"use client";

import { LogOut, User, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  userName: string;
  userEmail: string;
}

export default function TopBar({ userName, userEmail }: TopBarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Go to homepage"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{userName}</h1>
              <p className="text-sm text-slate-400">{userEmail}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
