"use client";

import { useState, useEffect } from 'react';
import { sessionApi, analyticsApi, SessionResponse, ImprovementRecommendations } from '@/lib/api';

export type ActivationState = 'new' | 'activated';

export interface Session {
  id: string;
  type: string;
  subtype?: string;
  date: string;
  status: 'completed' | 'aborted';
  score?: number;
  focus?: string;
}

export interface TrainingFocus {
  title: string;
  tags: string[];
  agendaTemplate: string;
}

export interface UserProfile {
  activationState: ActivationState;
  preparationType: string;
  meetingSubtype: string;
  agenda: string;
  tone: string;
  cvText: string;
  sessions: Session[];
  improvements: string[];
  trainingFocus?: TrainingFocus;
}

const DEFAULT_PROFILE: UserProfile = {
  activationState: 'new',
  preparationType: 'Interview',
  meetingSubtype: '',
  agenda: '',
  tone: 'Professional & Confident',
  cvText: '',
  sessions: [],
  improvements: []
};

/**
 * Hook for managing user profile and session data
 * Now integrated with backend APIs
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile data from backend on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  /**
   * Load profile data from backend APIs
   */
  const loadProfileData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load local preferences (non-backend data)
      const savedLocal = localStorage.getItem('prapp_profile_local');
      let localData = DEFAULT_PROFILE;
      
      if (savedLocal) {
        try {
          localData = JSON.parse(savedLocal);
        } catch (e) {
          console.error('Failed to parse local profile', e);
        }
      }

      // Try to load sessions from backend
      try {
        const sessionsResponse = await sessionApi.getSessions({ limit: 10 });
        
        // Convert backend sessions to frontend format
        const sessions: Session[] = sessionsResponse.sessions.map((s: SessionResponse) => ({
          id: s.session_id,
          type: s.preparation_type,
          subtype: s.meeting_subtype,
          date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: s.status === 'completed' ? 'completed' : 'aborted',
          score: undefined, // Will be loaded from evaluation if needed
          focus: s.context_payload.agenda
        }));

        // Determine activation state based on sessions
        const activationState: ActivationState = sessions.length > 0 ? 'activated' : 'new';

        // Try to load improvements from analytics
        let improvements: string[] = [];
        if (sessions.length > 0) {
          try {
            const improvementsData: ImprovementRecommendations = await analyticsApi.getImprovements();
            improvements = improvementsData.practice_suggestions || [];
          } catch (e) {
            console.warn('Could not load improvements:', e);
          }
        }

        setProfile({
          ...localData,
          activationState,
          sessions,
          improvements
        });
      } catch (apiError) {
        // If API fails, use local data only
        console.warn('Could not load backend data, using local only:', apiError);
        setProfile(localData);
      }

      setIsLoaded(true);
    } catch (e) {
      console.error('Error loading profile:', e);
      setError('Failed to load profile data');
      setProfile(DEFAULT_PROFILE);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update profile (local preferences only)
   * Session data is managed through backend APIs
   */
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      
      // Save local preferences to localStorage
      const localData = {
        preparationType: newProfile.preparationType,
        meetingSubtype: newProfile.meetingSubtype,
        agenda: newProfile.agenda,
        tone: newProfile.tone,
        cvText: newProfile.cvText,
        trainingFocus: newProfile.trainingFocus,
        activationState: newProfile.activationState
      };
      
      localStorage.setItem('prapp_profile_local', JSON.stringify(localData));
      return newProfile;
    });
  };

  /**
   * Refresh sessions from backend
   */
  const refreshSessions = async () => {
    try {
      const sessionsResponse = await sessionApi.getSessions({ limit: 10 });
      
      const sessions: Session[] = sessionsResponse.sessions.map((s: SessionResponse) => ({
        id: s.session_id,
        type: s.preparation_type,
        subtype: s.meeting_subtype,
        date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: s.status === 'completed' ? 'completed' : 'aborted',
        score: undefined,
        focus: s.context_payload.agenda
      }));

      const activationState: ActivationState = sessions.length > 0 ? 'activated' : 'new';

      setProfile(prev => ({
        ...prev,
        sessions,
        activationState
      }));
    } catch (e) {
      console.error('Error refreshing sessions:', e);
      setError('Failed to refresh sessions');
    }
  };

  /**
   * Reset profile to defaults
   */
  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('prapp_profile_local');
  };

  return { 
    profile, 
    updateProfile, 
    resetProfile, 
    refreshSessions,
    isLoaded,
    isLoading,
    error
  };
}
