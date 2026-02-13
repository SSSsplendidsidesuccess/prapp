"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CTA Section */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Ready to begin?
            </h2>
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-400/20"
            >
              Start preparing
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
          <div className="flex items-center gap-8 mb-4 md:mb-0">
            <span className="text-slate-500 font-bold text-sm">prapp</span>
            <Link href="#" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              Terms
            </Link>
          </div>
          
          <div className="text-slate-600 text-sm">
            © MMXXV prapp — preps & practice app
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

