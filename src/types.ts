export interface EnhancementEffect {
  type: 'SKILL_BOOST' | 'LEARNING_RATE';
  skill?: string; // for SKILL_BOOST
  value: number;
}

export interface Enhancement {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: EnhancementEffect;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  label?: string;
  skills: { [key: string]: number };
  breakthroughPoints: number;
  unlockedEnhancements: string[];
}

export enum TrainingStatus {
  SETUP = 'SETUP',
  TRAINING = 'TRAINING',
  RESULTS = 'RESULTS',
}

export interface PerformanceMetric {
  skill: string;
  before: number;
  after: number;
}

export interface TrainingResult {
  trainingLog: string;
  summary: string;
  metrics: PerformanceMetric[];
}

export interface TrainingSessionRecord {
  id: string;
  date: string;
  scenario: string;
  focus: string;
  result: TrainingResult;
}
