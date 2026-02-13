"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Menu, X, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white dark:bg-slate-950 rounded-sm transition-colors duration-300" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight transition-colors duration-300">prapp</span>
            <span className="hidden sm:block text-slate-500 text-sm ml-2 border-l border-slate-300 dark:border-slate-700 pl-2 transition-colors duration-300">
              preps & practice app
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
              Methodology
            </Link>
            <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
              Pricing
            </Link>
            
            <button
              onClick={toggleTheme}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
                >
                  <User size={16} />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-md font-semibold text-sm transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link href="#" className="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-base font-medium">
                Methodology
              </Link>
              <Link href="#" className="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-base font-medium">
                Pricing
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-base font-medium"
                  >
                    <User size={16} />
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-base font-medium"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-base font-medium">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-3 rounded-md font-semibold text-base transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

