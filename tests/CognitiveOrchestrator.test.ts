import { CognitiveOrchestrator } from '../src/agents/CognitiveOrchestrator';

describe('CognitiveOrchestrator', () => {
  it('should be defined', () => {
    expect(CognitiveOrchestrator).toBeDefined();
  });

  describe('getCacheStatistics', () => {
    it('should return a hitRate of 0 when the cache is empty', () => {
      const orchestrator = new CognitiveOrchestrator();
      const stats = orchestrator.getCacheStatistics();
      expect(stats.hitRate).toBe(0);
    });
  });
});