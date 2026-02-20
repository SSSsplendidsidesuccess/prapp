"use client";

import { FileText, User, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/hooks/useProfile";
import Card from "./Card";
import Chip from "./Chip";
import { PREP_TYPES, SUBTYPES_MAP, TONE_OPTIONS } from "./constants";

interface PreparationInputsProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export default function PreparationInputs({ profile, updateProfile }: PreparationInputsProps) {
  const currentSubtypes = SUBTYPES_MAP[profile.preparationType] || [];

  // Dynamic placeholder based on preparation type
  const getBackgroundPlaceholder = () => {
    switch (profile.preparationType) {
      case 'Sales':
        return "Share your sales experience, product knowledge, or company background to help the AI simulate realistic customer conversations...";
      case 'Pitch':
        return "Describe your startup, product, or idea. Include your role, key metrics, and what makes it unique...";
      case 'Corporate':
        return "Share your role, team, and relevant project context to help the AI ask strategic questions...";
      case 'Interview':
        return "Paste your CV, LinkedIn summary, or bio here to personalize the AI's questions...";
      default:
        return "Share relevant background information to personalize your practice session...";
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Preparation Type Selection */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 px-1">What are you preparing for?</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {PREP_TYPES.map((type) => (
            <Chip
              key={type.id}
              label={type.label}
              icon={type.icon}
              selected={profile.preparationType === type.id}
              onClick={() => updateProfile({ preparationType: type.id, meetingSubtype: '' })}
            />
          ))}
        </div>

        {/* Subtypes (Conditional) */}
        <AnimatePresence mode="wait">
          {currentSubtypes.length > 0 && (
            <motion.div
              key={profile.preparationType}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/30 rounded-xl p-4 border border-white/5 mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                  {profile.preparationType} Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentSubtypes.map((subtype) => (
                    <button
                      key={subtype}
                      onClick={() => updateProfile({ meetingSubtype: subtype })}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                        ${profile.meetingSubtype === subtype
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-white/5'}
                      `}
                    >
                      {subtype}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 2. Meeting Details */}
      <section>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-amber-400" size={20} />
            <h3 className="font-bold text-white">Meeting details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Agenda or topics to cover
              </label>
              <textarea
                value={profile.agenda}
                onChange={(e) => updateProfile({ agenda: e.target.value })}
                placeholder="e.g. Walk through my resume, discuss the Q3 roadmap, handle objections about pricing..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Tone & Style
              </label>
              <select
                value={profile.tone}
                onChange={(e) => updateProfile({ tone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all appearance-none"
              >
                {TONE_OPTIONS.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Anything important to keep in mind?
              </label>
              <textarea
                placeholder="Write it in your own words..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all min-h-[60px] resize-y"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Example: &lsquo;Keep it short&rsquo;, &lsquo;Avoid jargon&rsquo;, &lsquo;Don&rsquo;t mention salary&rsquo;, &lsquo;Be friendly but firm&rsquo;.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Background Context */}
      <section>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="text-amber-400" size={20} />
              <h3 className="font-bold text-white">
                Your background <span className="text-slate-500 font-normal text-sm ml-1">(Optional)</span>
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={profile.cvText}
              onChange={(e) => updateProfile({ cvText: e.target.value })}
              placeholder={getBackgroundPlaceholder()}
              className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all min-h-[80px] resize-y"
            />
            
            <button className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <Upload size={14} />
              Upload CV (optional)
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}
