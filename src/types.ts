/**
 * @file Defines the core data structures and type definitions used throughout the SovereigntyOS AI application.
 * These types ensure data consistency for agents, enhancements, training sessions, and performance metrics.
 */

/**
 * Represents the effect of an enhancement on an agent's abilities.
 */
export interface EnhancementEffect {
  /**
   * The type of effect.
   * - `SKILL_BOOST`: Directly increases a specific skill level.
   * - `LEARNING_RATE`: Improves the rate at which an agent learns during training.
   */
  type: 'SKILL_BOOST' | 'LEARNING_RATE';
  /**
   * The specific skill to be boosted. Required only when `type` is 'SKILL_BOOST'.
   * @type {string}
   * @optional
   */
  skill?: string;
  /**
   * The numerical value of the effect (e.g., the amount to boost a skill by).
   */
  value: number;
}

/**
 * Defines an unlockable enhancement that can be applied to an agent to improve its performance.
 */
export interface Enhancement {
  /**
   * A unique identifier for the enhancement.
   * @type {string}
   */
  id: string;
  /**
   * The name of the enhancement.
   * @type {string}
   */
  name: string;
  /**
   * A detailed description of what the enhancement does.
   * @type {string}
   */
  description: string;
  /**
   * The cost in breakthrough points to unlock this enhancement.
   * @type {number}
   */
  cost: number;
  /**
   * The specific effect the enhancement provides.
   * @type {EnhancementEffect}
   */
  effect: EnhancementEffect;
}

/**
 * Represents an AI agent within the system.
 */
export interface Agent {
  /**
   * A unique identifier for the agent.
   * @type {string}
   */
  id: string;
  /**
   * The name of the agent.
   * @type {string}
   */
  name: string;
  /**
   * A brief description of the agent's specialization and background.
   * @type {string}
   */
  description: string;
  /**
   * A URL or path to the agent's avatar image.
   * @type {string}
   */
  avatar: string;
  /**
   * An optional label for display purposes (e.g., "Lead Orchestrator").
   * @type {string}
   * @optional
   */
  label?: string;
  /**
   * A map of the agent's skills and their current proficiency levels.
   * The key is the skill name, and the value is the skill level.
   * @type {{ [key: string]: number }}
   */
  skills: { [key: string]: number };
  /**
   * The number of points the agent has available to unlock enhancements.
   * @type {number}
   */
  breakthroughPoints: number;
  /**
   * A list of IDs of the enhancements the agent has unlocked.
   * @type {string[]}
   */
  unlockedEnhancements: string[];
}

/**
 * Represents the various states of a training session.
 */
export enum TrainingStatus {
  /**
   * The initial state where the training scenario is being configured.
   */
  SETUP = 'SETUP',
  /**
   * The state where the training simulation is actively running.
   */
  TRAINING = 'TRAINING',
  /**
   * The state where the training is complete and results are being displayed.
   */
  RESULTS = 'RESULTS',
}

/**
 * A data structure to hold the performance change of a single skill during a training session.
 */
export interface PerformanceMetric {
  /**
   * The name of the skill being measured.
   * @type {string}
   */
  skill: string;
  /**
   * The skill level before the training session.
   * @type {number}
   */
  before: number;
  /**
   * The skill level after the training session.
   * @type {number}
   */
  after: number;
}

/**
 * Encapsulates the complete results of a training session.
 */
export interface TrainingResult {
  /**
   * A detailed, step-by-step log of the events that occurred during training.
   * @type {string}
   */
  trainingLog: string;
  /**
   * A high-level summary of the training outcome.
   * @type {string}
   */
  summary: string;
  /**
   * An array of performance metrics detailing skill improvements.
   * @type {PerformanceMetric[]}
   */
  metrics: PerformanceMetric[];
}

/**
 * Represents a historical record of a completed training session.
 */
export interface TrainingSessionRecord {
  /**
   * A unique identifier for the training session.
   * @type {string}
   */
  id: string;
  /**
   * The date the training session was conducted, in ISO string format.
   * @type {string}
   */
  date: string;
  /**
   * The name or description of the scenario used for training.
   * @type {string}
   */
  scenario: string;
  /**
   * The primary skill or area of focus for the session.
   * @type {string}
   */
  focus: string;
  /**
   * The detailed results of the training session.
   * @type {TrainingResult}
   */
  result: TrainingResult;
}