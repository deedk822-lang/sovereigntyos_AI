/**
 * @file TrainingDashboard component for the SovereigntyOS AI Lab.
 * This component is the main interactive area where users can configure and
 * run training sessions for the selected AI agent, and view the results and history.
 */
import React from 'react';
import { type Agent, type TrainingResult, type TrainingSessionRecord, TrainingStatus } from '../types';

interface TrainingDashboardProps {
  selectedAgent: Agent | null;
  trainingStatus: TrainingStatus;
  trainingResult: TrainingResult | null;
  agentHistory: TrainingSessionRecord[];
  onStartTraining: (scenario: string, focus: string) => void;
  onReset: () => void;
  error: string | null;
}

/**
 * A dashboard for managing and viewing AI agent training sessions.
 * It provides controls for starting training, and detailed views for results and history.
 * @param {TrainingDashboardProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered dashboard.
 */
export function TrainingDashboard({
  selectedAgent,
  trainingStatus,
  trainingResult,
  agentHistory,
  onStartTraining,
  onReset,
  error,
}: TrainingDashboardProps): React.ReactElement {
  const [scenario, setScenario] = React.useState('');
  const [focus, setFocus] = React.useState('');

  const handleStartClick = () => {
    if (scenario && focus) {
      onStartTraining(scenario, focus);
    }
  };

  if (!selectedAgent) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center bg-gray-900">
        <p className="text-2xl text-gray-500">Select an agent to begin.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 bg-gray-900 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-4xl font-bold">Training Dashboard</h1>
            <p className="text-lg text-gray-400">
              Agent: <span className="font-semibold text-indigo-400">{selectedAgent.name}</span>
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-600 text-white px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
              </div>
            )}

            {trainingStatus === TrainingStatus.SETUP && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-4">Configure Training Session</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="scenario" className="block text-sm font-medium text-gray-300 mb-1">Training Scenario</label>
                    <input type="text" id="scenario" value={scenario} onChange={(e) => setScenario(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., 'Analyze complex market data'" />
                  </div>
                  <div>
                    <label htmlFor="focus" className="block text-sm font-medium text-gray-300 mb-1">Focus Area</label>
                    <input type="text" id="focus" value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., 'Pattern Recognition'" />
                  </div>
                  <button onClick={handleStartClick} disabled={!scenario || !focus} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                    Start Training
                  </button>
                </div>
              </div>
            )}

            {trainingStatus === TrainingStatus.TRAINING && (
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-2xl font-semibold">Training in progress...</p>
                    <p className="text-gray-400">Analyzing performance and compiling results.</p>
                </div>
              </div>
            )}

            {trainingStatus === TrainingStatus.RESULTS && trainingResult && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Training Results</h2>
                    <button onClick={onReset} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold">
                        Run New Training
                    </button>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold mb-2">Summary</h3>
                    <p className="text-gray-300">{trainingResult.summary}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
                    <ul className="space-y-3">
                        {trainingResult.metrics.map(metric => (
                            <li key={metric.skill} className="flex items-center justify-between">
                                <span className="font-medium text-gray-300">{metric.skill}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{metric.before}</span>
                                    <span>&rarr;</span>
                                    <span className="font-bold text-indigo-400 text-lg">{metric.after}</span>
                                    <span className="font-bold text-green-400 text-sm">(+{metric.after - metric.before})</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold mb-2">Training Log</h3>
                    <pre className="bg-gray-900 p-4 rounded-md text-xs text-gray-400 overflow-x-auto max-h-48">{trainingResult.trainingLog}</pre>
                </div>
              </div>
            )}
          </div>

          {/* History column */}
          <aside className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Training History</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-xl max-h-[600px] overflow-y-auto space-y-3">
              {agentHistory.length > 0 ? (
                agentHistory.map(record => (
                  <div key={record.id} className="bg-gray-700 p-3 rounded-md border-l-4 border-indigo-500">
                    <p className="text-sm font-semibold text-white">{record.scenario}</p>
                    <p className="text-xs text-gray-400">Focus: {record.focus}</p>
                    <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No training history for this agent.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}