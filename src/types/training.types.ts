import { EmergencyContact } from "./emergency.types";

export interface TrainingModule {
  id: string;
  title: string;
  category: 'FIRST_AID' | 'EMERGENCY_RESPONSE' | 'SAFETY' | 'EQUIPMENT';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // in minutes
  content: TrainingContent[];
  prerequisites?: string[];
  certification?: {
    type: string;
    validityPeriod: number; // in months
    issuingAuthority: string;
  };
}

export interface TrainingContent {
  id: string;
  type: 'VIDEO' | 'ANIMATION' | 'TEXT' | 'QUIZ' | 'INTERACTIVE';
  title: string;
  description: string;
  content: {
    url?: string;
    text?: string;
    duration?: number;
    questions?: QuizQuestion[];
  };
  order: number;
  completed?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface EmergencyProcedure {
  id: string;
  title: string;
  type: 'MEDICAL' | 'FIRE' | 'NATURAL_DISASTER' | 'SECURITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  steps: ProcedureStep[];
  warnings: string[];
  equipment: string[];
  contacts: EmergencyContact[];
}

export interface ProcedureStep {
  id: string;
  order: number;
  instruction: string;
  details?: string;
  image?: string;
  duration?: number; // in seconds
  critical: boolean;
}
