"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile, TrainingFocus, Session } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { sessionApi, SessionCreate, PreparationType } from '@/lib/api';

// Import extracted components
import TopBar from '@/components/profile/TopBar';
import PreparationInputs from '@/components/profile/PreparationInputs';
import ActivatedSummaryStrip from '@/components/profile/ActivatedSummaryStrip';
import SessionList from '@/components/profile/SessionList';
import ImprovementCard from '@/components/profile/ImprovementCard';
import SessionSetupAccordion from '@/components/profile/SessionSetupAccordion';

// Mock data for improvements (will be replaced with API data)
const DEFAULT_IMPROVEMENTS = [
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

function DashboardPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile, refreshSessions, isLoaded } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Show loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const isActivated = profile.activationState === 'activated';

  const handleStartSession = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const sessionData: SessionCreate = {
        preparation_type: profile.preparationType as PreparationType,
        meeting_subtype: profile.meetingSubtype || undefined,
        agenda: profile.agenda || undefined,
        tone: profile.tone,
        role_context: profile.cvText || undefined
      };

      const session = await sessionApi.createSession(sessionData);
      await refreshSessions();
      router.push(`/session/${session.session_id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsSubmitting(false);
    }
  };

  const scrollToSetup = () => {
    const setupSection = document.getElementById('session-setup');
    if (setupSection) {
      setupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setAccordionOpen(true);
    }
  };

  const handlePractice = (focus: TrainingFocus) => {
    updateProfile({ trainingFocus: focus });
    scrollToSetup();
  };

  const handleFocusChange = (focusTitle: string) => {
    const improvement = DEFAULT_IMPROVEMENTS.find(imp => imp.title === focusTitle);
    if (improvement) {
      updateProfile({ trainingFocus: improvement.focus });
    }
  };

  const handleSessionClick = (session: Session) => {
    router.push(`/session/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      <TopBar userName={user.name} userEmail={user.email} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isActivated ? (
          <motion.div
            key="activated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <ActivatedSummaryStrip
              sessionsThisWeek={2}
              sessionGoal={3}
              avgScore={74}
              scoreChange={11}
              trendScores={[62, 68, 71, 73, 74]}
              currentFocus={profile.trainingFocus?.title}
              onFocusClick={handleFocusChange}
            />

            <section>
              <h2 className="text-xl font-bold text-white mb-4 px-1">Focus on what matters</h2>
              <div className="space-y-3">
                {DEFAULT_IMPROVEMENTS.map((imp, i) => (
                  <ImprovementCard
                    key={i}
                    title={imp.title}
                    text={imp.text}
                    tags={imp.tags}
                    onPractice={() => handlePractice(imp.focus)}
                    onExample={() => {/* TODO: Show example modal */}}
                  />
                ))}
              </div>
            </section>

            <SessionList
              sessions={profile.sessions}
              onSessionClick={handleSessionClick}
              onViewAll={() => router.push('/sessions')}
            />

            <SessionSetupAccordion
              profile={profile}
              updateProfile={updateProfile}
              isOpen={accordionOpen}
              setIsOpen={setAccordionOpen}
            />

            {/* Start Session Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8 pb-6 px-4">
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={handleStartSession}
                  disabled={isSubmitting}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-4 rounded-xl shadow-2xl shadow-amber-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start practice session
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <PreparationInputs profile={profile} updateProfile={updateProfile} />

            {/* Start Session Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8 pb-6 px-4">
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={handleStartSession}
                  disabled={isSubmitting || !profile.preparationType}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-4 rounded-xl shadow-2xl shadow-amber-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start practice session
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
