/**
 * @file AgentSidebar component for the SovereigntyOS AI Lab.
 * This component displays the list of available AI agents, allows the user to select one,
 * and shows detailed information about the selected agent including their skills and enhancements.
 */
import React from 'react';
import { type Agent, type Enhancement } from '../types';

interface AgentSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onUnlockEnhancement: (enhancementId: string) => void;
  enhancements: Enhancement[];
}

/**
 * A sidebar component to display and manage AI agents, their skills, and unlockable enhancements.
 * @param {AgentSidebarProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered sidebar.
 */
export function AgentSidebar({ agents, selectedAgent, onSelectAgent, onUnlockEnhancement, enhancements }: AgentSidebarProps): React.ReactElement {
  return (
    <aside className="w-96 bg-gray-800 border-r border-gray-700 p-4 flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Agent Roster</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                selectedAgent?.id === agent.id
                  ? 'bg-indigo-600 border-indigo-400 shadow-lg scale-105'
                  : 'bg-gray-700 border-transparent hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center">
                <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full border-2 border-gray-500" />
                <div className="ml-3">
                  <h3 className="font-bold text-lg text-white">{agent.name}</h3>
                  <p className="text-sm text-indigo-200">{agent.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAgent && (
        <div className="flex-grow flex flex-col space-y-4 pt-4 border-t border-gray-700">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">Agent Intel</h3>
            <p className="text-gray-400 text-sm mb-4">{selectedAgent.description}</p>
            <div className="bg-gray-700 p-3 rounded-lg">
                <h4 className="text-lg font-semibold text-white">Skills</h4>
                <ul className="mt-2 space-y-2">
                    {Object.entries(selectedAgent.skills).map(([skill, level]) => (
                        <li key={skill}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-300">{skill}</span>
                                <span className="font-bold text-indigo-300">{level}</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${level}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>

          <div className="flex-grow flex flex-col bg-gray-700 p-3 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Enhancements</h3>
            <p className="text-sm text-gray-400 mb-3">
                Points: <span className="font-bold text-yellow-400">{selectedAgent.breakthroughPoints}</span>
            </p>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                {enhancements.map(enhancement => {
                    const isUnlocked = selectedAgent.unlockedEnhancements.includes(enhancement.id);
                    const canAfford = selectedAgent.breakthroughPoints >= enhancement.cost;
                    return (
                        <div key={enhancement.id} className="bg-gray-800 p-3 rounded-md border border-gray-600">
                            <h4 className="font-bold text-white">{enhancement.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{enhancement.description}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className={`font-bold text-sm ${isUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {isUnlocked ? 'Unlocked' : `Cost: ${enhancement.cost}`}
                                </span>
                                {!isUnlocked && (
                                    <button
                                        onClick={() => onUnlockEnhancement(enhancement.id)}
                                        disabled={!canAfford}
                                        className="text-xs font-bold py-1 px-3 rounded transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Unlock
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}