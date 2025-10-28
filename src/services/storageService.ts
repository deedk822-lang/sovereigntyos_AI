/**
 * @file This service provides a simple abstraction over the browser's `localStorage` API.
 * It is used to persist the application's state, including the list of agents and their
 * individual training histories, so that user progress is not lost between sessions.
 */

import { type Agent, type TrainingSessionRecord } from '../types';

// Define the keys used to store data in localStorage to avoid magic strings.
const AGENTS_KEY = 'sovereigntyos_agents_v1';
const HISTORY_KEY_PREFIX = 'sovereigntyos_history_v1_';

/**
 * Saves the entire array of agents to local storage.
 * The data is serialized to a JSON string before being stored.
 * @param {Agent[]} agents - The array of agent objects to save.
 */
export function saveAgents(agents: Agent[]): void {
  try {
    const serializedAgents = JSON.stringify(agents);
    localStorage.setItem(AGENTS_KEY, serializedAgents);
  } catch (error) {
    console.error("Failed to save agents to local storage:", error);
    // In a real app, might show a notification to the user.
  }
}

/**
 * Loads the array of agents from local storage.
 * It deserializes the JSON string back into an array of Agent objects.
 * @returns {Agent[] | null} The array of agents, or `null` if no data is found
 * or if an error occurs during parsing.
 */
export function loadAgents(): Agent[] | null {
  try {
    const serializedAgents = localStorage.getItem(AGENTS_KEY);
    if (serializedAgents === null) {
      return null;
    }
    return JSON.parse(serializedAgents);
  } catch (error) {
    console.error("Failed to load agents from local storage:", error);
    return null;
  }
}

/**
 * Saves the training history for a single agent to local storage.
 * Each agent's history is stored under a unique key based on its ID.
 * @param {string} agentId - The unique identifier for the agent.
 * @param {TrainingSessionRecord[]} history - The array of training session records to save.
 */
export function saveHistory(agentId: string, history: TrainingSessionRecord[]): void {
  try {
    const serializedHistory = JSON.stringify(history);
    localStorage.setItem(`${HISTORY_KEY_PREFIX}${agentId}`, serializedHistory);
  } catch (error) {
    console.error(`Failed to save history for agent ${agentId}:`, error);
  }
}

/**
 * Loads the training history for a single agent from local storage.
 * @param {string} agentId - The unique identifier for the agent whose history to load.
 * @returns {TrainingSessionRecord[]} The array of training records, or an empty array
 * if no history is found or an error occurs.
 */
export function loadHistory(agentId: string): TrainingSessionRecord[] {
  try {
    const serializedHistory = localStorage.getItem(`${HISTORY_KEY_PREFIX}${agentId}`);
    if (serializedHistory === null) {
      return [];
    }
    return JSON.parse(serializedHistory);
  } catch (error) {
    console.error(`Failed to load history for agent ${agentId}:`, error);
    return [];
  }
}