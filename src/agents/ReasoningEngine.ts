/**
 * Advanced Reasoning Engine for SovereigntyOS AI
 * Implements Chain-of-Thought, Tree-of-Thoughts, and Multi-Agent Reasoning
 */

import { CognitiveOrchestrator } from './CognitiveOrchestrator';

interface ThoughtNode {
  id: string;
  content: string;
  confidence: number;
  depth: number;
  parentId: string | null;
  childIds: string[];
  reasoning: string;
  evidence: string[];
  contradictions: string[];
  timestamp: Date;
}

interface ReasoningPath {
  nodes: ThoughtNode[];
  score: number;
  coherence: number;
  completeness: number;
  evidence_strength: number;
}

interface CriticalThinkingFramework {
  analyse_assumptions: boolean;
  evaluate_evidence: boolean;
  consider_alternatives: boolean;
  check_logical_consistency: boolean;
  assess_credibility: boolean;
  identify_biases: boolean;
}

export class ReasoningEngine {
  private thoughtTree: Map<string, ThoughtNode> = new Map();
  private reasoningPaths: ReasoningPath[] = [];
  private cognitiveOrchestrator: CognitiveOrchestrator;
  private criticalThinkingEnabled: boolean = true;

  constructor(orchestrator: CognitiveOrchestrator) {
    this.cognitiveOrchestrator = orchestrator;
  }

  /**
   * Advanced reasoning with Tree-of-Thoughts methodology
   */
  async performAdvancedReasoning(
    query: string,
    context: {
      domain?: string;
      complexity?: 'simple' | 'medium' | 'complex' | 'expert';
      requires_creativity?: boolean;
      requires_analysis?: boolean;
      requires_synthesis?: boolean;
    } = {}
  ): Promise<{
    conclusion: string;
    reasoning_path: ThoughtNode[];
    confidence: number;
    alternatives: string[];
    evidence: string[];
    assumptions: string[];
    potential_biases: string[];
  }> {
    console.log('🧠 Starting advanced reasoning for:', query);

    // Phase 1: Generate initial thought branches
    const initialThoughts = await this.generateInitialThoughts(query, context);
    
    // Phase 2: Expand thought tree with multiple reasoning paths
    const expandedTree = await this.expandReasoningTree(initialThoughts, context);
    
    // Phase 3: Critical evaluation of all paths
    const evaluatedPaths = await this.evaluateReasoningPaths(expandedTree, context);
    
    // Phase 4: Synthesize best reasoning path
    const bestPath = this.selectOptimalReasoningPath(evaluatedPaths);
    
    // Phase 5: Critical thinking validation
    const validatedConclusion = await this.applyCriticalThinking(bestPath, query, context);
    
    return validatedConclusion;
  }

  /**
   * Generate multiple initial thought branches using different AI agents
   */
  private async generateInitialThoughts(
    query: string,
    context: any
  ): Promise<ThoughtNode[]> {
    const perspectives = [
      'analytical_perspective',
      'creative_perspective',
      'skeptical_perspective',
      'practical_perspective',
      'ethical_perspective'
    ];

    const initialThoughts: ThoughtNode[] = [];

    for (const perspective of perspectives) {
      const thoughtPrompt = this.constructPerspectivePrompt(query, perspective, context);
      
      const response = await this.cognitiveOrchestrator.processComplexQuery(
        thoughtPrompt,
        {
          complexity: 'medium',
          domain: context.domain || 'general',
          metadata: { perspective, reasoning_phase: 'initial_thoughts' }
        }
      );

      const thoughtNode: ThoughtNode = {
        id: this.generateNodeId(),
        content: response.response,
        confidence: response.confidence,
        depth: 0,
        parentId: null,
        childIds: [],
        reasoning: `Generated from ${perspective}`,
        evidence: this.extractEvidence(response.response),
        contradictions: [],
        timestamp: new Date()
      };

      this.thoughtTree.set(thoughtNode.id, thoughtNode);
      initialThoughts.push(thoughtNode);
    }

    return initialThoughts;
  }

  /**
   * Expand reasoning tree by generating child thoughts for each branch
   */
  private async expandReasoningTree(
    initialThoughts: ThoughtNode[],
    context: any,
    maxDepth: number = 3
  ): Promise<ThoughtNode[]> {
    let currentLevel = initialThoughts;
    let allNodes = [...initialThoughts];

    for (let depth = 1; depth <= maxDepth; depth++) {
      const nextLevel: ThoughtNode[] = [];

      for (const parentNode of currentLevel) {
        // Generate 2-3 child thoughts for each promising parent
        if (parentNode.confidence > 0.6) {
          const childThoughts = await this.generateChildThoughts(parentNode, context, depth);
          
          for (const childThought of childThoughts) {
            parentNode.childIds.push(childThought.id);
            this.thoughtTree.set(childThought.id, childThought);
            nextLevel.push(childThought);
            allNodes.push(childThought);
          }
        }
      }

      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }

    return allNodes;
  }

  /**
   * Generate child thoughts by refining and expanding parent thoughts
   */
  private async generateChildThoughts(
    parentNode: ThoughtNode,
    context: any,
    depth: number
  ): Promise<ThoughtNode[]> {
    const expansionStrategies = [
      'deeper_analysis',
      'alternative_approach',
      'evidence_examination'
    ];

    const childThoughts: ThoughtNode[] = [];

    for (const strategy of expansionStrategies.slice(0, 2)) { // Limit to 2 children per parent
      const expansionPrompt = this.constructExpansionPrompt(parentNode, strategy, context);
      
      const response = await this.cognitiveOrchestrator.processComplexQuery(
        expansionPrompt,
        {
          complexity: depth > 2 ? 'complex' : 'medium',
          domain: context.domain || 'general',
          metadata: { expansion_strategy: strategy, parent_id: parentNode.id }
        }
      );

      const childNode: ThoughtNode = {
        id: this.generateNodeId(),
        content: response.response,
        confidence: response.confidence * (1 - depth * 0.1), // Decrease confidence with depth
        depth,
        parentId: parentNode.id,
        childIds: [],
        reasoning: `Expanded from parent using ${strategy}`,
        evidence: this.extractEvidence(response.response),
        contradictions: await this.identifyContradictions(response.response, parentNode.content),
        timestamp: new Date()
      };

      childThoughts.push(childNode);
    }

    return childThoughts;
  }

  /**
   * Evaluate all reasoning paths and score them
   */
  private async evaluateReasoningPaths(
    allNodes: ThoughtNode[],
    context: any
  ): Promise<ReasoningPath[]> {
    const paths = this.extractReasoningPaths(allNodes);
    const evaluatedPaths: ReasoningPath[] = [];

    for (const path of paths) {
      const evaluation = await this.evaluatePath(path, context);
      evaluatedPaths.push({
        nodes: path,
        score: evaluation.score,
        coherence: evaluation.coherence,
        completeness: evaluation.completeness,
        evidence_strength: evaluation.evidence_strength
      });
    }

    return evaluatedPaths.sort((a, b) => b.score - a.score);
  }

  /**
   * Extract all possible reasoning paths from root to leaf nodes
   */
  private extractReasoningPaths(allNodes: ThoughtNode[]): ThoughtNode[][] {
    const rootNodes = allNodes.filter(node => node.parentId === null);
    const paths: ThoughtNode[][] = [];

    for (const root of rootNodes) {
      this.findPathsFromNode(root, [root], paths);
    }

    return paths;
  }

  /**
   * Recursively find all paths from a given node to leaf nodes
   */
  private findPathsFromNode(
    node: ThoughtNode,
    currentPath: ThoughtNode[],
    allPaths: ThoughtNode[][]
  ): void {
    if (node.childIds.length === 0) {
      // Leaf node - add current path
      allPaths.push([...currentPath]);
      return;
    }

    for (const childId of node.childIds) {
      const childNode = this.thoughtTree.get(childId);
      if (childNode) {
        this.findPathsFromNode(childNode, [...currentPath, childNode], allPaths);
      }
    }
  }

  /**
   * Evaluate a reasoning path for quality metrics
   */
  private async evaluatePath(
    path: ThoughtNode[],
    context: any
  ): Promise<{
    score: number;
    coherence: number;
    completeness: number;
    evidence_strength: number;
  }> {
    // Calculate coherence (logical flow between nodes)
    const coherence = this.calculateCoherence(path);
    
    // Calculate completeness (how well the path addresses the original query)
    const completeness = this.calculateCompleteness(path, context);
    
    // Calculate evidence strength
    const evidence_strength = this.calculateEvidenceStrength(path);
    
    // Overall score combining all factors
    const score = (coherence * 0.4) + (completeness * 0.4) + (evidence_strength * 0.2);

    return { score, coherence, completeness, evidence_strength };
  }

  private calculateCoherence(path: ThoughtNode[]): number {
    if (path.length < 2) return 1.0;

    let coherenceSum = 0;
    for (let i = 1; i < path.length; i++) {
      // Simple coherence calculation based on confidence and contradiction count
      const contradictionPenalty = path[i].contradictions.length * 0.1;
      const nodeCoherence = Math.max(0, path[i].confidence - contradictionPenalty);
      coherenceSum += nodeCoherence;
    }

    return coherenceSum / (path.length - 1);
  }

  private calculateCompleteness(path: ThoughtNode[], context: any): number {
    // Simple completeness based on path depth and final confidence
    const finalNode = path[path.length - 1];
    const depthBonus = Math.min(path.length / 4, 1) * 0.2;
    return Math.min(finalNode.confidence + depthBonus, 1.0);
  }

  private calculateEvidenceStrength(path: ThoughtNode[]): number {
    const totalEvidence = path.reduce((sum, node) => sum + node.evidence.length, 0);
    return Math.min(totalEvidence / (path.length * 2), 1.0);
  }

  /**
   * Select the optimal reasoning path
   */
  private selectOptimalReasoningPath(evaluatedPaths: ReasoningPath[]): ReasoningPath {
    // Return the highest scoring path
    return evaluatedPaths[0] || { nodes: [], score: 0, coherence: 0, completeness: 0, evidence_strength: 0 };
  }

  /**
   * Apply critical thinking framework to validate conclusions
   */
  private async applyCriticalThinking(
    bestPath: ReasoningPath,
    originalQuery: string,
    context: any
  ): Promise<{
    conclusion: string;
    reasoning_path: ThoughtNode[];
    confidence: number;
    alternatives: string[];
    evidence: string[];
    assumptions: string[];
    potential_biases: string[];
  }> {
    const finalNode = bestPath.nodes[bestPath.nodes.length - 1];
    
    // Apply critical thinking framework
    const criticalAnalysis = await this.performCriticalAnalysis(bestPath, originalQuery);
    
    return {
      conclusion: finalNode?.content || 'No conclusion reached',
      reasoning_path: bestPath.nodes,
      confidence: bestPath.score,
      alternatives: criticalAnalysis.alternatives,
      evidence: criticalAnalysis.evidence,
      assumptions: criticalAnalysis.assumptions,
      potential_biases: criticalAnalysis.biases
    };
  }

  /**
   * Perform critical analysis of the reasoning path
   */
  private async performCriticalAnalysis(
    path: ReasoningPath,
    originalQuery: string
  ): Promise<{
    alternatives: string[];
    evidence: string[];
    assumptions: string[];
    biases: string[];
  }> {
    const allEvidence = path.nodes.reduce((acc, node) => [...acc, ...node.evidence], [] as string[]);
    
    // Generate critical analysis using the cognitive orchestrator
    const criticalPrompt = `
Perform a critical analysis of this reasoning:

Original Query: ${originalQuery}

Reasoning Path: ${path.nodes.map(n => n.content).join(' -> ')}

Identify:
1. Key assumptions being made
2. Alternative perspectives or solutions
3. Potential cognitive biases
4. Strength of evidence presented

Provide structured analysis.
`;

    const analysis = await this.cognitiveOrchestrator.processComplexQuery(
      criticalPrompt,
      {
        complexity: 'complex',
        domain: 'critical_thinking',
        metadata: { analysis_type: 'critical_validation' }
      }
    );

    return {
      alternatives: this.extractAlternatives(analysis.response),
      evidence: allEvidence,
      assumptions: this.extractAssumptions(analysis.response),
      biases: this.extractBiases(analysis.response)
    };
  }

  // Helper methods
  private constructPerspectivePrompt(query: string, perspective: string, context: any): string {
    const perspectiveInstructions = {
      analytical_perspective: 'Analyze this systematically with data and logic',
      creative_perspective: 'Approach this with creative and innovative thinking',
      skeptical_perspective: 'Question assumptions and look for potential flaws',
      practical_perspective: 'Focus on practical implementation and real-world constraints',
      ethical_perspective: 'Consider ethical implications and moral dimensions'
    };

    return `
From a ${perspective.replace('_', ' ')}, ${perspectiveInstructions[perspective as keyof typeof perspectiveInstructions]}:

Query: ${query}

Context: ${JSON.stringify(context)}

Provide your analysis and reasoning.
`;
  }

  private constructExpansionPrompt(parentNode: ThoughtNode, strategy: string, context: any): string {
    const strategyInstructions = {
      deeper_analysis: 'Dive deeper into the analysis with more detail and nuance',
      alternative_approach: 'Consider an alternative approach or perspective',
      evidence_examination: 'Examine and strengthen the evidence base'
    };

    return `
Building on this thought: "${parentNode.content}"

Using ${strategy.replace('_', ' ')} strategy: ${strategyInstructions[strategy as keyof typeof strategyInstructions]}

Expand and refine the reasoning.
`;
  }

  private async identifyContradictions(newContent: string, parentContent: string): Promise<string[]> {
    // Simple contradiction detection - would be more sophisticated in production
    const contradictions: string[] = [];
    
    if (newContent.includes('not') && parentContent.includes('is')) {
      contradictions.push('Potential negation contradiction detected');
    }
    
    return contradictions;
  }

  private extractEvidence(content: string): string[] {
    // Extract evidence markers from content
    const evidenceMarkers = content.match(/evidence shows|research indicates|studies demonstrate|data reveals/gi) || [];
    return evidenceMarkers;
  }

  private extractAlternatives(content: string): string[] {
    const alternatives = content.match(/alternatively|another approach|different perspective/gi) || [];
    return alternatives.map(alt => `Alternative approach identified: ${alt}`);
  }

  private extractAssumptions(content: string): string[] {
    const assumptions = content.match(/assuming|if we assume|given that/gi) || [];
    return assumptions.map(ass => `Assumption: ${ass}`);
  }

  private extractBiases(content: string): string[] {
    const biases = content.match(/confirmation bias|availability heuristic|anchoring bias/gi) || [];
    return biases.map(bias => `Potential bias: ${bias}`);
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for monitoring
  getThoughtTreeStatistics(): {
    totalNodes: number;
    averageDepth: number;
    branchingFactor: number;
    pathCount: number;
  } {
    const nodes = Array.from(this.thoughtTree.values());
    const depths = nodes.map(n => n.depth);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const pathCount = this.extractReasoningPaths(nodes).length;
    
    return {
      totalNodes: nodes.length,
      averageDepth: avgDepth,
      branchingFactor: nodes.reduce((sum, n) => sum + n.childIds.length, 0) / nodes.length,
      pathCount
    };
  }

  clearReasoningTree(): void {
    this.thoughtTree.clear();
    this.reasoningPaths = [];
  }
}