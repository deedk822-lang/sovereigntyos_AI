import {
  EnhancedCognitiveArchitecture,
  CognitiveScaffolding,
  UserModel,
  CognitiveModule,
  CognitiveModuleType,
  WorkflowTask,
  CognitiveInput,
  CognitiveOutput,
  ScaffoldingLevel
} from '../src/cognitive-architecture/core';

// Mock Cognitive Module for testing
class MockCognitiveModule implements CognitiveModule {
  id: string;
  name: string;
  type: CognitiveModuleType;
  private processedCount = 0;
  private totalProcessingTime = 0;

  constructor(id: string, name: string, type: CognitiveModuleType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  async process(input: CognitiveInput): Promise<CognitiveOutput> {
    const startTime = Date.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const processingTime = Date.now() - startTime;
    this.processedCount++;
    this.totalProcessingTime += processingTime;

    return {
      id: `output-${Date.now()}`,
      moduleId: this.id,
      result: {
        processed: true,
        inputType: input.type,
        moduleType: this.type,
        data: input.data
      },
      confidence: 0.85,
      processingTime,
      metadata: {
        module: this.name,
        timestamp: new Date().toISOString()
      }
    };
  }

  updateState(feedback: any): void {
    // Mock implementation
    console.log(`Module ${this.name} received feedback:`, feedback);
  }

  getMetrics() {
    return {
      averageProcessingTime: this.totalProcessingTime / Math.max(this.processedCount, 1),
      successRate: 0.9,
      averageConfidence: 0.85,
      totalProcessed: this.processedCount,
      lastUpdated: new Date()
    };
  }
}

describe('Enhanced Cognitive Architecture', () => {
  let architecture: EnhancedCognitiveArchitecture;
  let mockTask: WorkflowTask;

  beforeEach(() => {
    architecture = new EnhancedCognitiveArchitecture();
    
    mockTask = {
      id: 'test-task-1',
      type: 'analysis',
      domain: 'data-processing',
      inputSize: 1000,
      steps: ['step1', 'step2', 'step3'],
      dependencies: ['dep1'],
      domainSpecificityScore: 0.6,
      requiresReasoning: true,
      requiresLearning: false,
      requiresMemory: true,
      requiresDecision: true
    };
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await architecture.initialize();
      expect(architecture).toBeDefined();
    });

    test('should emit initialized event', async () => {
      const mockCallback = jest.fn();
      architecture.on('initialized', mockCallback);
      
      await architecture.initialize();
      expect(mockCallback).toHaveBeenCalled();
    });

    test('should not initialize twice', async () => {
      await architecture.initialize();
      await architecture.initialize(); // Should not cause issues
      expect(architecture).toBeDefined();
    });
  });

  describe('Module Registration', () => {
    test('should register cognitive modules', () => {
      const module = new MockCognitiveModule('test-1', 'Test Module', CognitiveModuleType.PERCEPTION);
      architecture.registerModule(module);
      
      const metrics = architecture.getModuleMetrics();
      expect(metrics['test-1']).toBeDefined();
    });

    test('should emit moduleRegistered event', () => {
      const mockCallback = jest.fn();
      architecture.on('moduleRegistered', mockCallback);
      
      const module = new MockCognitiveModule('test-2', 'Test Module 2', CognitiveModuleType.REASONING);
      architecture.registerModule(module);
      
      expect(mockCallback).toHaveBeenCalledWith(module);
    });
  });

  describe('Workflow Processing', () => {
    beforeEach(() => {
      // Register test modules
      const perceptionModule = new MockCognitiveModule('perception-1', 'Perception', CognitiveModuleType.PERCEPTION);
      const reasoningModule = new MockCognitiveModule('reasoning-1', 'Reasoning', CognitiveModuleType.REASONING);
      const memoryModule = new MockCognitiveModule('memory-1', 'Memory', CognitiveModuleType.MEMORY);
      const decisionModule = new MockCognitiveModule('decision-1', 'Decision', CognitiveModuleType.DECISION);
      const actionModule = new MockCognitiveModule('action-1', 'Action', CognitiveModuleType.ACTION);

      architecture.registerModule(perceptionModule);
      architecture.registerModule(reasoningModule);
      architecture.registerModule(memoryModule);
      architecture.registerModule(decisionModule);
      architecture.registerModule(actionModule);
    });

    test('should process workflow successfully', async () => {
      const result = await architecture.processWorkflow(mockTask);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.metadata.cognitive_architecture).toBe('enhanced_scaffolding');
    });

    test('should emit workflowCompleted event', async () => {
      const mockCallback = jest.fn();
      architecture.on('workflowCompleted', mockCallback);
      
      await architecture.processWorkflow(mockTask);
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          task: mockTask,
          result: expect.any(Object)
        })
      );
    });

    test('should handle workflow errors', async () => {
      const mockCallback = jest.fn();
      architecture.on('workflowError', mockCallback);
      
      // Create a task that will cause an error
      const invalidTask = { ...mockTask, id: null } as any;
      
      await expect(architecture.processWorkflow(invalidTask)).rejects.toThrow();
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Feedback System', () => {
    test('should handle feedback correctly', () => {
      const mockCallback = jest.fn();
      architecture.on('feedbackReceived', mockCallback);
      
      const feedback = {
        outputId: 'test-output-1',
        accuracy: 0.9,
        usefulness: 0.8,
        userSatisfaction: 0.85
      };
      
      architecture.provideFeedback('test-output-1', feedback);
      
      expect(mockCallback).toHaveBeenCalledWith({
        outputId: 'test-output-1',
        feedback
      });
    });
  });

  describe('Metrics Collection', () => {
    test('should return module metrics', () => {
      const module = new MockCognitiveModule('metrics-test', 'Metrics Test', CognitiveModuleType.LEARNING);
      architecture.registerModule(module);
      
      const metrics = architecture.getModuleMetrics();
      expect(metrics['metrics-test']).toBeDefined();
      expect(metrics['metrics-test'].averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(metrics['metrics-test'].successRate).toBeGreaterThan(0);
    });
  });

  describe('User Model Access', () => {
    test('should provide access to user model', () => {
      const userModel = architecture.getUserModel();
      expect(userModel).toBeInstanceOf(UserModel);
    });
  });
});

describe('UserModel', () => {
  let userModel: UserModel;

  beforeEach(() => {
    userModel = new UserModel();
  });

  test('should return default expertise level for unknown domain', () => {
    const expertise = userModel.getDomainExpertise('unknown-domain');
    expect(expertise).toBe(0.3); // Default novice level
  });

  test('should return cognitive load tolerance', () => {
    const tolerance = userModel.getCognitiveLoadTolerance();
    expect(tolerance).toBe(0.7);
  });

  test('should update expertise based on feedback', () => {
    const domain = 'test-domain';
    const initialExpertise = userModel.getDomainExpertise(domain);
    
    const feedback = {
      outputId: 'test-1',
      accuracy: 0.9,
      usefulness: 0.8,
      userSatisfaction: 0.85
    };
    
    userModel.updateExpertise(domain, feedback);
    
    const updatedExpertise = userModel.getDomainExpertise(domain);
    expect(updatedExpertise).toBeGreaterThan(initialExpertise);
  });

  test('should not exceed maximum expertise level', () => {
    const domain = 'max-test-domain';
    
    // Simulate multiple high-accuracy feedback
    for (let i = 0; i < 20; i++) {
      userModel.updateExpertise(domain, {
        outputId: `test-${i}`,
        accuracy: 1.0,
        usefulness: 1.0,
        userSatisfaction: 1.0
      });
    }
    
    const expertise = userModel.getDomainExpertise(domain);
    expect(expertise).toBeLessThanOrEqual(1.0);
  });
});

describe('CognitiveScaffolding', () => {
  let scaffolding: CognitiveScaffolding;
  let modules: Map<string, CognitiveModule>;

  beforeEach(() => {
    scaffolding = new CognitiveScaffolding({
      progressiveAutonomy: true,
      adaptivePersonalization: true,
      cognitiveLoadOptimization: true
    });

    modules = new Map();
    modules.set('perception', new MockCognitiveModule('perception', 'Perception', CognitiveModuleType.PERCEPTION));
    modules.set('reasoning', new MockCognitiveModule('reasoning', 'Reasoning', CognitiveModuleType.REASONING));
    modules.set('action', new MockCognitiveModule('action', 'Action', CognitiveModuleType.ACTION));
  });

  test('should execute workflow with scaffolding', async () => {
    const task: WorkflowTask = {
      id: 'scaffolding-test',
      type: 'analysis',
      domain: 'test-domain',
      inputSize: 500,
      steps: ['analyze', 'decide'],
      dependencies: [],
      requiresReasoning: true
    };

    const result = await scaffolding.execute(task, modules);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.metadata.cognitive_architecture).toBe('enhanced_scaffolding');
    expect(result.metadata.optimization_applied).toBe(true);
  });

  test('should handle empty module set', async () => {
    const emptyModules = new Map<string, CognitiveModule>();
    const task: WorkflowTask = {
      id: 'empty-test',
      type: 'simple',
      domain: 'test',
      inputSize: 100,
      steps: ['step1'],
      dependencies: []
    };

    const result = await scaffolding.execute(task, emptyModules);
    expect(result).toBeDefined();
  });
});

describe('MockCognitiveModule', () => {
  let module: MockCognitiveModule;

  beforeEach(() => {
    module = new MockCognitiveModule('test-module', 'Test Module', CognitiveModuleType.PERCEPTION);
  });

  test('should process input correctly', async () => {
    const input: CognitiveInput = {
      id: 'test-input',
      type: 'test-data',
      data: { value: 42 },
      context: {
        sessionId: 'session-1',
        environment: 'development',
        capabilities: [],
        constraints: {},
        preferences: {
          autonomyLevel: 'medium',
          cognitiveLoadTolerance: 0.7,
          preferredInteractionStyle: 'collaborative',
          domainExpertise: {}
        }
      },
      timestamp: new Date(),
      priority: 1
    };

    const output = await module.process(input);
    
    expect(output.id).toBeDefined();
    expect(output.moduleId).toBe('test-module');
    expect(output.result.processed).toBe(true);
    expect(output.confidence).toBe(0.85);
    expect(output.processingTime).toBeGreaterThan(0);
  });

  test('should update metrics after processing', async () => {
    const input: CognitiveInput = {
      id: 'metrics-test',
      type: 'test',
      data: {},
      context: {
        sessionId: 'session-1',
        environment: 'development',
        capabilities: [],
        constraints: {},
        preferences: {
          autonomyLevel: 'medium',
          cognitiveLoadTolerance: 0.7,
          preferredInteractionStyle: 'collaborative',
          domainExpertise: {}
        }
      },
      timestamp: new Date(),
      priority: 1
    };

    const initialMetrics = module.getMetrics();
    await module.process(input);
    const updatedMetrics = module.getMetrics();
    
    expect(updatedMetrics.totalProcessed).toBe(initialMetrics.totalProcessed + 1);
  });

  test('should handle feedback', () => {
    const feedback = {
      outputId: 'test-output',
      accuracy: 0.9,
      usefulness: 0.8,
      userSatisfaction: 0.85
    };
    
    // Should not throw
    expect(() => module.updateState(feedback)).not.toThrow();
  });
});