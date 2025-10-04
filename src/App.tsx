/**
 * @file This file contains the main root component of the SovereigntyOS AI Lab application.
 * It orchestrates the overall application state, including agent data, training sessions,
 * and user interactions. It brings together the main UI components like the sidebar and dashboard.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AgentSidebar } from './components/AgentSidebar';
import { TrainingDashboard } from './components/TrainingDashboard';
import { Header } from './components/Header';
import {
  type Agent,
  type TrainingResult,
  TrainingStatus,
  type TrainingSessionRecord,
  type Enhancement,
} from './types';
import { AGENTS_DATA, ENHANCEMENTS_DATA } from './constants';
import { runTrainingSession } from './services/geminiService';
import { loadAgents, saveAgents, loadHistory, saveHistory } from './services/storageService';

/**
 * The main application component. It manages the state for agents, training,
 * history, and enhancements, and passes data and handlers down to child components.
 * @returns {React.ReactElement} The rendered application UI.
 */
export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.SETUP);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [agentHistory, setAgentHistory] = useState<TrainingSessionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect hook to initialize agents on component mount.
   * It attempts to load agents from local storage, otherwise falls back to the default data.
   */
  useEffect(() => {
    const initialAgents = loadAgents();
    if (initialAgents && initialAgents.length > 0) {
      setAgents(initialAgents);
      setSelectedAgent(initialAgents[0]);
    } else {
      setAgents(AGENTS_DATA);
      setSelectedAgent(AGENTS_DATA[0]);
      saveAgents(AGENTS_DATA);
    }
  }, []);

  /**
   * Effect hook to load the training history for the currently selected agent.
   * This runs whenever the selected agent changes.
   */
  useEffect(() => {
    if (selectedAgent) {
      setAgentHistory(loadHistory(selectedAgent.id));
    }
  }, [selectedAgent]);

  /**
   * Handles the selection of an agent from the sidebar.
   * @param {Agent} agent - The agent that was selected.
   */
  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setTrainingStatus(TrainingStatus.SETUP);
    setTrainingResult(null);
    setError(null);
  }, []);

  /**
   * Initiates a training session for the selected agent.
   * It calls the training service, processes the results, updates the agent's skills
   * and breakthrough points, and saves the new state and history record.
   * @param {string} scenario - The training scenario description.
   * @param {string} focus - The focus area for the training.
   */
  const handleStartTraining = useCallback(
    async (scenario: string, focus: string) => {
      if (!selectedAgent) return;
      setTrainingStatus(TrainingStatus.TRAINING);
      setError(null);
      setTrainingResult(null);

      try {
        const result = await runTrainingSession(selectedAgent, scenario, focus);
        setTrainingResult(result);
        setTrainingStatus(TrainingStatus.RESULTS);

        const newSkillsCount = result.metrics.filter((m) => m.before === 0 && m.after > 0).length;
        const pointsEarned = newSkillsCount;

        const updatedAgents = agents.map((a) => {
          if (a.id !== selectedAgent.id) return a;
          const newSkills = { ...a.skills };
          result.metrics.forEach((metric) => {
            newSkills[metric.skill] = metric.after;
          });
          return { ...a, skills: newSkills, breakthroughPoints: a.breakthroughPoints + pointsEarned };
        });

        setSelectedAgent(updatedAgents.find((a) => a.id === selectedAgent.id) ?? null);
        setAgents(updatedAgents);
        saveAgents(updatedAgents);

        const newRecord: TrainingSessionRecord = {
          id: new Date().toISOString(), date: new Date().toLocaleString(), scenario, focus, result,
        };
        const updatedHistory = [newRecord, ...agentHistory];
        setAgentHistory(updatedHistory);
        saveHistory(selectedAgent.id, updatedHistory);
      } catch (e: any) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred during training.');
        setTrainingStatus(TrainingStatus.SETUP);
      }
    },
    [selectedAgent, agents, agentHistory]
  );

  /**
   * Handles unlocking an enhancement for the selected agent.
   * It verifies if the agent has enough points, then applies the enhancement effect
   * and updates the agent's state.
   * @param {string} enhancementId - The ID of the enhancement to unlock.
   */
  const handleUnlockEnhancement = useCallback(
    (enhancementId: string) => {
      const enhancement: Enhancement | undefined = ENHANCEMENTS_DATA.find((e) => e.id === enhancementId);
      if (!enhancement || !selectedAgent || selectedAgent.breakthroughPoints < enhancement.cost) return;

      const updatedAgents = agents.map((a) => {
        if (a.id !== selectedAgent.id) return a;
        const updated: Agent = {
          ...a,
          breakthroughPoints: a.breakthroughPoints - enhancement.cost,
          unlockedEnhancements: [...a.unlockedEnhancements, enhancementId],
          skills: { ...a.skills },
        };
        if (enhancement.effect.type === 'SKILL_BOOST' && enhancement.effect.skill) {
          updated.skills[enhancement.effect.skill] = (updated.skills[enhancement.effect.skill] || 0) + enhancement.effect.value;
        }
        return updated;
      });

      setSelectedAgent(updatedAgents.find((a) => a.id === selectedAgent.id) ?? null);
      setAgents(updatedAgents);
      saveAgents(updatedAgents);
    },
    [selectedAgent, agents]
  );

  /**
   * Resets the current training view to the setup state.
   */
  const handleReset = useCallback(() => {
    setTrainingStatus(TrainingStatus.SETUP);
    setTrainingResult(null);
    setError(null);
  }, []);

  /**
   * Exports all agent and history data to a JSON backup file.
   */
  const handleExportData = useCallback(() => {
    try {
      const allHistories: { [agentId: string]: TrainingSessionRecord[] } = {};
      agents.forEach((agent) => {
        allHistories[agent.id] = loadHistory(agent.id);
      });
      const backupData = { agents, histories: allHistories };
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_lab_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data:', e);
      setError('Could not create backup file.');
    }
  }, [agents]);

  /**
   * Imports agent and history data from a JSON backup file.
   * @param {File} file - The JSON file to import.
   */
  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error('Failed to read file content.');

        const data = JSON.parse(result);
        if (!data.agents || !data.histories) throw new Error("Invalid backup file format.");

        setAgents(data.agents);
        saveAgents(data.agents);
        Object.keys(data.histories).forEach((agentId) => {
          saveHistory(agentId, data.histories[agentId]);
        });
        setSelectedAgent(data.agents[0] || null);
        setTrainingStatus(TrainingStatus.SETUP);
        setError(null);
      } catch (e) {
        console.error('Failed to import data:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred during import.');
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header onExport={handleExportData} onImport={handleImportData} />
      <div className="flex flex-1">
        <AgentSidebar
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          onUnlockEnhancement={handleUnlockEnhancement}
          enhancements={ENHANCEMENTS_DATA}
        />
        <TrainingDashboard
          selectedAgent={selectedAgent}
          trainingStatus={trainingStatus}
          trainingResult={trainingResult}
          agentHistory={agentHistory}
          onStartTraining={handleStartTraining}
          onReset={handleReset}
          error={error}
        />
      </div>
    </div>
  );
}