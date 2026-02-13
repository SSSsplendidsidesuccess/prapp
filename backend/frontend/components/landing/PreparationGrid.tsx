"use client";

import React from 'react';
import { Briefcase, Monitor, Shapes, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  {
    icon: Briefcase,
    title: "Interview or role",
    description: "Panels, technicals, or leadership rounds"
  },
  {
    icon: Monitor,
    title: "High-stakes meeting",
    description: "Executive syncs, boards, or strategy"
  },
  {
    icon: Shapes,
    title: "Presentation or pitch",
    description: "Keynotes, demos, or product pitches"
  },
  {
    icon: RefreshCw,
    title: "Post-event reflection",
    description: "Review signals and extract insights"
  }
];

const PreparationGrid = () => {
  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What are you preparing for?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-400/30 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-amber-400/10 transition-colors">
                <card.icon className="text-slate-400 group-hover:text-amber-400 transition-colors" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreparationGrid;

