"use client";

import { Settings2, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/hooks/useProfile";
import PreparationInputs from "./PreparationInputs";

interface SessionSetupAccordionProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function SessionSetupAccordion({
  profile,
  updateProfile,
  isOpen,
  setIsOpen
}: SessionSetupAccordionProps) {
  const summaryText = `Current setup: ${[
    profile.preparationType,
    profile.meetingSubtype,
    profile.tone
  ].filter(Boolean).join(' · ')}`;

  return (
    <section 
      id="session-setup" 
      className={`border border-white/10 rounded-xl overflow-hidden bg-slate-900/20 transition-all duration-500 ${
        isOpen ? 'ring-1 ring-amber-400/30' : ''
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Settings2 size={16} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-sm">Session setup</h3>
            {!isOpen && (
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                {summaryText}
              </p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-slate-500" />
        ) : (
          <ChevronDown size={18} className="text-slate-500" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-white/5">
              {profile.trainingFocus && (
                <div className="mb-4 pt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Focus tags:
                  </span>
                  <div className="flex gap-2">
                    {profile.trainingFocus.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className={profile.trainingFocus ? "pt-2" : "pt-6"}>
                <PreparationInputs profile={profile} updateProfile={updateProfile} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
