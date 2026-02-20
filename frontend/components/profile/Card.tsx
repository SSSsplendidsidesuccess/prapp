"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-slate-900/40 border border-white/10 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
