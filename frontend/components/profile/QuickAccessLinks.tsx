"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Lightbulb, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickAccessLinks() {
  const router = useRouter();

  const links = [
    {
      title: 'Knowledge Base',
      description: 'Manage your sales documents and materials',
      icon: BookOpen,
      href: '/knowledge-base',
      color: 'blue',
    },
    {
      title: 'Talk Points',
      description: 'Generate AI-powered sales talk points',
      icon: Lightbulb,
      href: '/talk-points',
      color: 'purple',
    },
    {
      title: 'Sales Setup',
      description: 'Configure and start a sales practice session',
      icon: ChevronRight,
      href: '/sales-setup',
      color: 'amber',
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white px-1">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link, index) => {
          const Icon = link.icon;
          const colorClasses = {
            blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-400/40 text-blue-400',
            purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-400/40 text-purple-400',
            amber: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40 text-amber-400',
          };

          return (
            <motion.button
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => router.push(link.href)}
              className={`${colorClasses[link.color as keyof typeof colorClasses]} border rounded-xl p-5 text-left transition-all hover:scale-105 active:scale-95`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-current/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-snug">
                    {link.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
