"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  Mic,
  TrendingUp,
  Presentation,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Clock,
  BarChart2,
  CheckCircle2,
  Play,
  History,
  User,
  Settings2,
  Target,
  Zap,
  X,
  Edit3,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile, UserProfile, TrainingFocus } from '../../hooks/useProfile';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { sessionApi, SessionCreate, PreparationType } from '@/lib/api';

// --- Components ---

const TopBar = ({ 
  showDevToggle, 
  activationState, 
  onToggleState 
}: { 
  showDevToggle: boolean;
  activationState: string;
  onToggleState: () => void;
}) => (
  <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center">
        <div className="w-4 h-4 bg-slate-950 rounded-sm" />
      </div>
      <span className="font-bold text-white text-lg tracking-tight">prapp</span>
    </div>
    <div className="flex items-center gap-3">
      {showDevToggle && (
        <button 
          onClick={onToggleState}
          className="hidden md:block text-[10px] text-slate-600 hover:text-amber-400 font-mono border border-slate-800 px-2 py-1 rounded bg-slate-900/50 mr-2 transition-colors"
          title="Designer Preview: Toggle User State"
        >
          Preview: {activationState}
        </button>
      )}
      <span className="text-sm font-medium text-slate-400 hidden sm:block">Preparation profile</span>
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
        <User size={16} />
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-white mb-4 px-1">{children}</h2>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900/50 border border-white/5 rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

const Chip = ({ 
  label, 
  icon: Icon, 
  selected, 
  onClick 
}: { 
  label: string, 
  icon?: React.ElementType, 
  selected: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
      ${selected 
        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105' 
        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'}
    `}
  >
    {Icon && <Icon size={16} />}
    {label}
  </button>
);

const PREP_TYPES = [
  { id: 'Interview', label: 'Interview', icon: Briefcase },
  { id: 'Corporate', label: 'Corporate', icon: Users },
  { id: 'Pitch', label: 'Pitch', icon: Mic },
  { id: 'Sales', label: 'Sales', icon: TrendingUp },
  { id: 'Presentation', label: 'Presentation', icon: Presentation },
  { id: 'Other', label: 'Other', icon: AlertCircle },
];

const SUBTYPES_MAP: Record<string, string[]> = {
  'Interview': [
    'Screening', 'Behavioral', 'Product sense', 'Case', 
    'System design', 'Technical', 'Hiring manager', 'Culture fit', 'Executive'
  ],
  'Corporate': [
    'Strategy meeting', 'Roadmap review', 'Executive / Steering committee', 
    'Quarterly business review (QBR)', 'Budget / Planning session', 
    'Board update', 'Stakeholder alignment'
  ],
  'Pitch': [
    'Startup', 'Product', 'Roadmap', 'Partnership', 'Internal'
  ],
  'Sales': [
    'Discovery', 'Demo', 'Negotiation', 'Closing', 'Client', 'Account'
  ],
  'Presentation': [
    'Conference', 'Workshop', 'Panel', 'Webinar', 'Training'
  ],
  'Other': [
    'Networking intro', 'Mentoring / coaching', 'Partner chat', 
    'Difficult ask', 'General'
  ]
};

// --- Sub-components for cleaner main file ---

const PreparationInputs = ({ profile, updateProfile }: { profile: UserProfile, updateProfile: (u: Partial<UserProfile>) => void }) => {
  const currentSubtypes = SUBTYPES_MAP[profile.preparationType] || [];

  return (
    <div className="space-y-8">
      {/* 1. Preparation Type Selection */}
      <section>
        <SectionTitle>What are you preparing for?</SectionTitle>
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{profile.preparationType} Type</p>
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Agenda or topics to cover</label>
              <textarea
                value={profile.agenda}
                onChange={(e) => updateProfile({ agenda: e.target.value })}
                placeholder="e.g. Walk through my resume, discuss the Q3 roadmap, handle objections about pricing..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone & Style</label>
              <select
                value={profile.tone}
                onChange={(e) => updateProfile({ tone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all appearance-none"
              >
                <option>Professional & Confident</option>
                <option>Casual & Friendly</option>
                <option>Direct & Concise</option>
                <option>Empathetic & Understanding</option>
                <option>Persuasive & High Energy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Anything important to keep in mind?</label>
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
              <h3 className="font-bold text-white">Your background <span className="text-slate-500 font-normal text-sm ml-1">(Optional)</span></h3>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={profile.cvText}
              onChange={(e) => updateProfile({ cvText: e.target.value })}
              placeholder="Paste your CV, LinkedIn summary, or bio here to personalize the AI's questions..."
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
};

const ActivatedSummaryStrip = ({ 
  onFocusClick, 
  currentFocus 
}: { 
  onFocusClick: (focus: string) => void,
  currentFocus?: string
}) => {
  const trendDots = [62, 68, 71, 73, 74];
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const focusOptions = ["Openings", "Structure (STAR)", "Objections", "Clarity", "Conciseness"];
  
  return (
    <div className="grid grid-cols-3 gap-2 mb-8">
      {/* Progress Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="text-2xl font-bold text-white">2 sessions</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">This week</div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">Goal: 3 sessions</div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
          <div className="h-full bg-amber-400 w-2/3" />
        </div>
      </div>

      {/* Avg Score Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-white">74</div>
          <div className="text-[10px] font-bold text-green-400">+11 pts</div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Avg Score</div>
        
        {/* Trend Dots */}
        <div className="flex gap-1.5 mt-2 items-end h-3">
          {trendDots.map((score, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-slate-600 rounded-full"
              style={{ height: `${(score - 50) / 4}px`, opacity: 0.4 + (i * 0.15) }}
            />
          ))}
        </div>
      </div>

      {/* Training Focus Tile */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center relative">
        <div className="text-lg font-bold text-white leading-tight mb-1">
          {currentFocus || "Handle objections"}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Training focus</div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFocusMenu(!showFocusMenu)}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-400/10 px-2 py-1 rounded-full"
          >
            Change focus
            <ChevronDown size={10} />
          </button>
          
          {showFocusMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 py-1">
              {focusOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    onFocusClick(opt);
                    setShowFocusMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionSetupAccordion = ({ 
  profile, 
  updateProfile, 
  isOpen, 
  setIsOpen 
}: { 
  profile: UserProfile, 
  updateProfile: (u: Partial<UserProfile>) => void,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  const summaryText = `Current setup: ${[
    profile.preparationType,
    profile.meetingSubtype,
    profile.tone
  ].filter(Boolean).join(' · ')}`;

  return (
    <section id="session-setup" className={`border border-white/10 rounded-xl overflow-hidden bg-slate-900/20 transition-all duration-500 ${isOpen ? 'ring-1 ring-amber-400/30' : ''}`}>
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
        {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus tags:</span>
                  <div className="flex gap-2">
                    {profile.trainingFocus.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
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
};

const ImprovementCard = ({ 
  title, 
  text, 
  tags, 
  onPractice,
  onExample
}: { 
  title: string, 
  text: string, 
  tags: string[], 
  onPractice: () => void,
  onExample: () => void
}) => (
  <div className="bg-slate-900/30 border border-white/5 hover:border-white/10 rounded-xl p-4 flex gap-4 transition-all group">
    <div className="w-1 self-stretch bg-amber-400/50 rounded-full" />
    <div className="flex-1">
      <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-300 mb-3 leading-relaxed font-medium">Why it matters: <span className="text-slate-400 font-normal">{text}</span></p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <span key={tag} className="text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onPractice}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-lg shadow-amber-400/10"
        >
          Practice now
        </button>
        <button 
          onClick={onExample}
          className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
        >
          See example
        </button>
      </div>
    </div>
  </div>
);

const SessionModal = ({ 
  session, 
  onClose, 
  onRepeat,
  onPracticeFocus
}: { 
  session: any, 
  onClose: () => void, 
  onRepeat: () => void,
  onPracticeFocus: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">{session.type} · {session.subtype}</h3>
          <p className="text-xs text-slate-400 mt-1">{session.date}</p>
        </div>
        <div className="text-3xl font-bold text-green-400">{session.score}</div>
      </div>
      
      <div className="space-y-4 mb-8">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strengths</h4>
          <div className="space-y-2">
            <div className="flex gap-2 text-sm text-slate-300">
              <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
              <span>Strong opening statement with clear intent</span>
            </div>
            <div className="flex gap-2 text-sm text-slate-300">
              <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
              <span>Maintained professional tone throughout</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Improve next</h4>
          <div className="space-y-2">
            <div className="flex gap-2 text-sm text-slate-300">
              <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Pacing was a bit fast during key points</span>
            </div>
            <div className="flex gap-2 text-sm text-slate-300">
              <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Could use more concrete examples</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onRepeat}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Repeat setup
        </button>
        <button 
          onClick={onPracticeFocus}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          Practice focus
        </button>
      </div>
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </motion.div>
  </div>
);

const ExampleModal = ({ 
  title, 
  onClose 
}: { 
  title: string, 
  onClose: () => void 
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
    >
      <h3 className="text-lg font-bold text-white mb-4">{title} Examples</h3>
      <div className="space-y-3 mb-6">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
          <p className="text-sm text-slate-300">"I have 5 years of experience in product management, focusing on B2B SaaS growth."</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
          <p className="text-sm text-slate-300">"My key strength is translating technical requirements into user value."</p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        Close
      </button>
    </motion.div>
  </div>
);

function ProfilePageContent() {
  const router = useRouter();
  const { profile, updateProfile, refreshSessions, isLoaded } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [exampleModalOpen, setExampleModalOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check for development environment
  const isDev = process.env.NODE_ENV === 'development';

  // Prevent hydration mismatch
  if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
  </div>;

  const handleStartSession = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create session via API
      const sessionData: SessionCreate = {
        preparation_type: profile.preparationType as PreparationType,
        meeting_subtype: profile.meetingSubtype || undefined,
        agenda: profile.agenda || undefined,
        tone: profile.tone,
        role_context: profile.cvText || undefined
      };

      const session = await sessionApi.createSession(sessionData);
      
      // Refresh sessions list
      await refreshSessions();
      
      // Navigate to session page
      router.push(`/session/${session.session_id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsSubmitting(false);
    }
  };

  const toggleActivationState = () => {
    updateProfile({ 
      activationState: profile.activationState === 'new' ? 'activated' : 'new' 
    });
  };

  const scrollToSetup = () => {
    setAccordionOpen(true);
    setTimeout(() => {
      document.getElementById('session-setup')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handlePractice = (focus: TrainingFocus) => {
    updateProfile({ 
      trainingFocus: focus,
      agenda: focus.agendaTemplate
    });
    scrollToSetup();
  };

  const handleFocusChange = (focusTitle: string) => {
    // Simple mapping for the dropdown
    const focusMap: Record<string, TrainingFocus> = {
      "Openings": {
        title: "Openings",
        tags: ["Conciseness", "Executive summary"],
        agendaTemplate: "Practice opening statements. Focus on: 1-sentence summary, key metrics, clear value prop."
      },
      "Structure (STAR)": {
        title: "Structure (STAR)",
        tags: ["Structure", "Behavioral"],
        agendaTemplate: "Answer 2 behavioral questions using STAR. Focus on: impact, numbers, your role."
      },
      "Objections": {
        title: "Objections",
        tags: ["Objections", "Sales / Discovery"],
        agendaTemplate: "Practice: acknowledge → reframe → ask a question. Use 3 objections: price, timeline, competition."
      },
      "Clarity": {
        title: "Clarity",
        tags: ["Clarity", "Communication"],
        agendaTemplate: "Practice explaining complex concepts simply. Avoid jargon. Use analogies."
      },
      "Conciseness": {
        title: "Conciseness",
        tags: ["Conciseness", "Brevity"],
        agendaTemplate: "Give 3 answers using: short answer → 2 details → close. Keep answers under 2 minutes."
      }
    };
    
    if (focusMap[focusTitle]) {
      handlePractice(focusMap[focusTitle]);
    }
  };

  const isActivated = profile.activationState === 'activated';

  // Mock sessions for Activated state
  const mockSessions = [
    { id: '1', type: 'Interview', subtype: 'Behavioral', date: 'Feb 8', score: 72, focus: 'Clarity' },
    { id: '2', type: 'Corporate', subtype: 'Strategy meeting', date: 'Feb 6', score: 81, focus: 'Structure' },
    { id: '3', type: 'Sales', subtype: 'Discovery', date: 'Feb 4', score: 68, focus: 'Objections' },
  ];

  const defaultImprovements = [
    {
      title: "Start with the short answer",
      text: "It makes you sound confident and saves time.",
      tags: ["Conciseness", "Executive summary"],
      focus: {
        title: "Start with the short answer",
        tags: ["Conciseness", "Executive summary"],
        agendaTemplate: "Give 3 answers using: short answer → 2 details → close. Topics: pricing objection, timeline risk, leadership example."
      }
    },
    {
      title: "Use STAR in the same order",
      text: "It keeps your story clear and easy to follow.",
      tags: ["Structure", "Behavioral"],
      focus: {
        title: "Use STAR in the same order",
        tags: ["Structure", "Behavioral"],
        agendaTemplate: "Answer 2 behavioral questions using STAR. Focus on: impact, numbers, your role."
      }
    },
    {
      title: "Handle objections in 3 steps",
      text: "You stay calm and move the conversation forward.",
      tags: ["Objections", "Sales / Discovery"],
      focus: {
        title: "Handle objections in 3 steps",
        tags: ["Objections", "Sales / Discovery"],
        agendaTemplate: "Practice: acknowledge → reframe → ask a question. Use 3 objections: price, timeline, competition."
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      <TopBar 
        showDevToggle={isDev}
        activationState={profile.activationState}
        onToggleState={toggleActivationState}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        {isActivated ? (
          // --- ACTIVATED USER LAYOUT ---
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* 1. Summary Strip */}
            <ActivatedSummaryStrip 
              onFocusClick={handleFocusChange} 
              currentFocus={profile.trainingFocus?.title}
            />

            {/* 2. Next Improvements */}
            <section>
              <div className="mb-4 px-1">
                <h2 className="text-xl font-bold text-white">Next improvements</h2>
                <p className="text-xs text-slate-500">Based on your last sessions</p>
              </div>
              
              <div className="space-y-3">
                {defaultImprovements.map((imp, i) => (
                  <ImprovementCard 
                    key={i}
                    title={imp.title}
                    text={imp.text}
                    tags={imp.tags}
                    onPractice={() => handlePractice(imp.focus)}
                    onExample={() => setExampleModalOpen(imp.title)}
                  />
                ))}
              </div>
            </section>

            {/* 3. Recent Sessions */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-white">Recent sessions</h2>
                <button className="text-xs text-amber-400 hover:text-amber-300 font-medium">View all</button>
              </div>
              
              <div className="space-y-3">
                {mockSessions.map((session) => (
                  <div 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)}
                    className="group bg-slate-900/30 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        <Play size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{session.type} · {session.subtype}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{session.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5">
                        {session.focus}
                      </span>
                      <span className="text-lg font-bold text-green-400">{session.score}</span>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Session Setup (Collapsed) */}
            <SessionSetupAccordion 
              profile={profile} 
              updateProfile={updateProfile} 
              isOpen={accordionOpen}
              setIsOpen={setAccordionOpen}
            />

          </motion.div>
        ) : (
          // --- NEW USER LAYOUT ---
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PreparationInputs profile={profile} updateProfile={updateProfile} />
          </motion.div>
        )}

      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}
          
          {!isActivated && (
            <p className="text-xs text-center text-slate-500 mb-1">
              Your session data is securely stored and synced to your account.
            </p>
          )}
          
          <div className="flex gap-3">
            {isActivated && (
              <button
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={profile.sessions.length === 0}
                title={profile.sessions.length === 0 ? "Complete your first session to review it." : ""}
              >
                Review last session
              </button>
            )}
            
            <button
              onClick={handleStartSession}
              disabled={isSubmitting}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-lg shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating session...</span>
                </>
              ) : (
                <>
                  {isActivated ? 'Start new session' : 'Start preparing'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Session Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionModal 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)}
            onRepeat={() => {
              // Just close modal, keeping current setup
              setSelectedSession(null);
              scrollToSetup();
            }}
            onPracticeFocus={() => {
              // Set focus based on session focus tag
              handleFocusChange(selectedSession.focus);
              setSelectedSession(null);
            }}
          />
        )}
        {exampleModalOpen && (
          <ExampleModal 
            title={exampleModalOpen}
            onClose={() => setExampleModalOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

