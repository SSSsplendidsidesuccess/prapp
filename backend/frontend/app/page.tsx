"use client";

import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import PreparationGrid from '../components/landing/PreparationGrid';
import HowItWorks from '../components/landing/HowItWorks';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-amber-400/30 selection:text-amber-400 transition-colors duration-300">
      <Navbar />
      <Hero />
      <PreparationGrid />
      <HowItWorks />
      <Footer />
    </main>
  );
}

