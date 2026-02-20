import {
  Briefcase,
  Users,
  Mic,
  TrendingUp,
  Presentation,
  AlertCircle,
} from 'lucide-react';

export const PREP_TYPES = [
  { id: 'Sales', label: 'Sales', icon: TrendingUp },
  { id: 'Pitch', label: 'Pitch', icon: Mic },
  { id: 'Corporate', label: 'Corporate', icon: Users },
  { id: 'Presentation', label: 'Presentation', icon: Presentation },
  { id: 'Interview', label: 'Interview', icon: Briefcase },
  { id: 'Other', label: 'Other', icon: AlertCircle },
];

export const SUBTYPES_MAP: Record<string, string[]> = {
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

export const TONE_OPTIONS = [
  'Professional & Confident',
  'Casual & Friendly',
  'Direct & Concise',
  'Empathetic & Understanding',
  'Persuasive & High Energy'
];
