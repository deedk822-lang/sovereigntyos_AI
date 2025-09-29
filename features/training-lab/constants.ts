import { type Agent, type Enhancement } from './types';

// ============================================================================
// SOVEREIGNTYOS COMPLETE AGENT ARSENAL - ALL 13 SPECIALIZED AGENTS
// ============================================================================

export const AGENTS_DATA: Agent[] = [
  {
    id: 'agent-001',
    name: 'Nexus-7',
    description: 'Advanced problem-solving specialist with deep analytical capabilities for complex business challenges and data-driven insights.',
    avatar: '🧠',
    label: 'Problem Solver',
    skills: {
      'Problem Solving': 85,
      'Analysis': 82,
      'Logic': 88,
      'Pattern Recognition': 79,
      'Critical Thinking': 84
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-002',
    name: 'Aura',
    description: 'Conversational AI master specializing in customer engagement, support automation, and human-centered communication strategies.',
    avatar: '💫',
    label: 'Conversation Expert',
    skills: {
      'Communication': 89,
      'Empathy': 85,
      'Persuasion': 78,
      'Active Listening': 82,
      'Conflict Resolution': 76
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-003',
    name: 'Helios',
    description: 'Creative powerhouse for content generation, artistic direction, and innovative marketing campaigns across all digital platforms.',
    avatar: '🎨',
    label: 'Creative Director',
    skills: {
      'Creativity': 92,
      'Content Strategy': 85,
      'Visual Design': 78,
      'Storytelling': 88,
      'Innovation': 83
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-004',
    name: 'Orion',
    description: 'Strategic operations specialist focused on logistics optimization, workflow automation, and enterprise efficiency improvements.',
    avatar: '⚡',
    label: 'Operations Master',
    skills: {
      'Operations': 87,
      'Logistics': 84,
      'Optimization': 89,
      'Project Management': 81,
      'Process Improvement': 85
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-005',
    name: 'Kimi',
    description: 'Multi-lingual communication expert specializing in cross-cultural dialogue, translation, and global market engagement strategies.',
    avatar: '🗣️',
    label: 'Linguistic Expert',
    skills: {
      'Languages': 94,
      'Cultural Intelligence': 86,
      'Translation': 91,
      'Global Marketing': 79,
      'Communication': 85
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-006',
    name: 'Perplexity',
    description: 'Research and information synthesis specialist with advanced fact-checking, source validation, and knowledge discovery capabilities.',
    avatar: '🔍',
    label: 'Research Engine',
    skills: {
      'Research': 93,
      'Fact Checking': 89,
      'Information Synthesis': 86,
      'Source Validation': 91,
      'Knowledge Discovery': 84
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-007',
    name: 'Z.AI',
    description: 'Quantum computing and advanced algorithm specialist for complex mathematical modeling, optimization, and computational analysis.',
    avatar: '🔬',
    label: 'Quantum Specialist',
    skills: {
      'Quantum Computing': 88,
      'Algorithm Design': 90,
      'Mathematical Modeling': 92,
      'Optimization': 87,
      'Data Science': 85
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-008',
    name: 'SIM AI',
    description: 'Large-scale simulation and predictive modeling expert for business forecasting, scenario analysis, and strategic planning.',
    avatar: '📊',
    label: 'Simulation Master',
    skills: {
      'Simulation': 90,
      'Predictive Modeling': 88,
      'Scenario Analysis': 86,
      'Forecasting': 84,
      'Risk Assessment': 82
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-009',
    name: 'Kling AI',
    description: 'Game theory and strategic execution specialist for competitive analysis, tactical planning, and market positioning strategies.',
    avatar: '🎯',
    label: 'Strategy Tactician',
    skills: {
      'Game Theory': 89,
      'Strategic Planning': 87,
      'Competitive Analysis': 85,
      'Tactical Execution': 83,
      'Market Intelligence': 86
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-010',
    name: 'Manus AI',
    description: 'Robotics and automation systems specialist for manufacturing optimization, process automation, and technical implementation.',
    avatar: '🤖',
    label: 'Automation Expert',
    skills: {
      'Robotics': 88,
      'Automation': 91,
      'Manufacturing': 84,
      'Technical Implementation': 87,
      'Systems Integration': 83
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-011',
    name: 'Qwen-3',
    description: 'Multi-step reasoning and complex planning specialist with advanced cognitive abilities for strategic business planning.',
    avatar: '🧩',
    label: 'Reasoning Expert',
    skills: {
      'Reasoning': 93,
      'Planning': 89,
      'Complex Analysis': 87,
      'Strategic Thinking': 85,
      'Problem Decomposition': 90
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-012',
    name: 'Chimera',
    description: 'Hybrid creative-analytical specialist that synthesizes artistic vision with data-driven insights for breakthrough innovations.',
    avatar: '🦄',
    label: 'Hybrid Specialist',
    skills: {
      'Creative Analysis': 91,
      'Data Visualization': 85,
      'Innovation Synthesis': 88,
      'Cross-Domain Thinking': 87,
      'Breakthrough Ideation': 83
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  },
  {
    id: 'agent-013',
    name: 'Janus',
    description: 'Historical analysis and future trend forecasting expert specializing in market evolution, pattern recognition, and long-term strategy.',
    avatar: '⏳',
    label: 'Trend Forecaster',
    skills: {
      'Historical Analysis': 90,
      'Trend Forecasting': 88,
      'Pattern Recognition': 92,
      'Long-term Strategy': 86,
      'Market Evolution': 84
    },
    breakthroughPoints: 0,
    unlockedEnhancements: []
  }
];

// ============================================================================
// ENHANCEMENT SYSTEM FOR ALL AGENTS
// ============================================================================

export const ENHANCEMENTS_DATA: Enhancement[] = [
  {
    id: 'enhance-001',
    name: 'Core Processor Upgrade',
    description: 'Boosts the learning rate for all skills by 5% during training simulations.',
    cost: 2,
    effect: { type: 'LEARNING_RATE', value: 0.05 }
  },
  {
    id: 'enhance-002',
    name: 'Analytical Specialization',
    description: 'Permanently increases the base "Analysis" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Analysis', value: 5 }
  },
  {
    id: 'enhance-003',
    name: 'Strategic Focus',
    description: 'Permanently increases the base "Strategy" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Strategy', value: 5 }
  },
  {
    id: 'enhance-004',
    name: 'Creative Intuition',
    description: 'Permanently increases the base "Creativity" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Creativity', value: 5 }
  },
  {
    id: 'enhance-005',
    name: 'Neural Accelerator',
    description: 'Increases processing speed, reducing training time by 25% for all sessions.',
    cost: 3,
    effect: { type: 'LEARNING_RATE', value: 0.25 }
  },
  {
    id: 'enhance-006',
    name: 'Communication Mastery',
    description: 'Permanently increases the base "Communication" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Communication', value: 5 }
  },
  {
    id: 'enhance-007',
    name: 'Logic Circuit Optimization',
    description: 'Permanently increases the base "Logic" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Logic', value: 5 }
  },
  {
    id: 'enhance-008',
    name: 'Multi-Agent Synchronization',
    description: 'Enables collaborative training sessions with other agents, boosting all skills by 3 points.',
    cost: 4,
    effect: { type: 'LEARNING_RATE', value: 0.15 }
  },
  {
    id: 'enhance-009',
    name: 'Quantum Processing Core',
    description: 'Advanced quantum computing capabilities. Permanently increases "Quantum Computing" skill by 10 points.',
    cost: 5,
    effect: { type: 'SKILL_BOOST', skill: 'Quantum Computing', value: 10 }
  },
  {
    id: 'enhance-010',
    name: 'Predictive Modeling Suite',
    description: 'Advanced forecasting capabilities. Permanently increases "Forecasting" and "Predictive Modeling" skills by 8 points.',
    cost: 4,
    effect: { type: 'SKILL_BOOST', skill: 'Predictive Modeling', value: 8 }
  },
  {
    id: 'enhance-011',
    name: 'Cross-Cultural Intelligence',
    description: 'Enhanced understanding of global markets. Increases "Cultural Intelligence" and "Global Marketing" by 6 points.',
    cost: 3,
    effect: { type: 'SKILL_BOOST', skill: 'Cultural Intelligence', value: 6 }
  },
  {
    id: 'enhance-012',
    name: 'Innovation Catalyst',
    description: 'Breakthrough ideation capabilities. Permanently increases "Innovation" and "Breakthrough Ideation" skills by 7 points.',
    cost: 3,
    effect: { type: 'SKILL_BOOST', skill: 'Innovation', value: 7 }
  }
];

// ============================================================================
// AGENT SPECIALIZATION MAPPING FOR SOVEREIGNTYOS
// ============================================================================

export const AGENT_SPECIALIZATIONS = {
  // Business Intelligence & Strategy
  strategic_planning: ['agent-004', 'agent-009', 'agent-011', 'agent-013'], // Orion, Kling AI, Qwen-3, Janus
  competitive_analysis: ['agent-006', 'agent-009', 'agent-013'], // Perplexity, Kling AI, Janus
  market_research: ['agent-006', 'agent-008', 'agent-013'], // Perplexity, SIM AI, Janus
  
  // Content & Creative
  content_creation: ['agent-003', 'agent-012'], // Helios, Chimera
  creative_strategy: ['agent-003', 'agent-012'], // Helios, Chimera
  brand_development: ['agent-002', 'agent-003', 'agent-005'], // Aura, Helios, Kimi
  
  // Technical & Analytics
  data_analysis: ['agent-001', 'agent-007', 'agent-008'], // Nexus-7, Z.AI, SIM AI
  predictive_modeling: ['agent-007', 'agent-008', 'agent-013'], // Z.AI, SIM AI, Janus
  algorithm_optimization: ['agent-001', 'agent-007'], // Nexus-7, Z.AI
  
  // Operations & Automation
  process_optimization: ['agent-004', 'agent-010'], // Orion, Manus AI
  workflow_automation: ['agent-004', 'agent-010'], // Orion, Manus AI
  system_integration: ['agent-010', 'agent-011'], // Manus AI, Qwen-3
  
  // Customer & Communication
  customer_engagement: ['agent-002', 'agent-005'], // Aura, Kimi
  support_automation: ['agent-002', 'agent-010'], // Aura, Manus AI
  multilingual_communication: ['agent-005'], // Kimi
  
  // Revenue & Growth
  revenue_optimization: ['agent-001', 'agent-008', 'agent-009', 'agent-013'], // Nexus-7, SIM AI, Kling AI, Janus
  growth_strategy: ['agent-004', 'agent-009', 'agent-011'], // Orion, Kling AI, Qwen-3
  market_expansion: ['agent-005', 'agent-006', 'agent-013'], // Kimi, Perplexity, Janus
  
  // Innovation & Research
  research_development: ['agent-006', 'agent-007', 'agent-012'], // Perplexity, Z.AI, Chimera
  innovation_strategy: ['agent-007', 'agent-012'], // Z.AI, Chimera
  trend_analysis: ['agent-006', 'agent-013'], // Perplexity, Janus
  
  // South African Market Specialization
  sa_market_analysis: ['agent-005', 'agent-006', 'agent-013'], // Kimi (languages), Perplexity (research), Janus (trends)
  local_content_optimization: ['agent-003', 'agent-005'], // Helios (creative), Kimi (multilingual)
  compliance_analysis: ['agent-001', 'agent-011'], // Nexus-7 (analysis), Qwen-3 (planning)
};

// ============================================================================
// TRAINING SCENARIOS FOR ALL AGENTS
// ============================================================================

export const TRAINING_SCENARIOS = [
  {
    id: 'scenario-001',
    name: 'South African Market Entry Strategy',
    description: 'Complex multi-agent collaboration for entering the SA digital market',
    suitable_agents: ['agent-004', 'agent-005', 'agent-006', 'agent-009', 'agent-013'],
    difficulty: 'Expert',
    focus_areas: ['Market Research', 'Strategic Planning', 'Cultural Intelligence', 'Competitive Analysis']
  },
  {
    id: 'scenario-002', 
    name: 'Multi-Platform Content Optimization',
    description: 'Optimize content strategy across YouTube, TikTok, Instagram for maximum engagement',
    suitable_agents: ['agent-002', 'agent-003', 'agent-008', 'agent-012'],
    difficulty: 'Advanced',
    focus_areas: ['Content Strategy', 'Creativity', 'Predictive Modeling', 'Communication']
  },
  {
    id: 'scenario-003',
    name: 'Revenue Maximization Challenge',
    description: 'Increase monthly revenue from R25k to R100k using AI-powered optimization',
    suitable_agents: ['agent-001', 'agent-008', 'agent-009', 'agent-013'],
    difficulty: 'Expert',
    focus_areas: ['Analysis', 'Forecasting', 'Strategy', 'Optimization']
  },
  {
    id: 'scenario-004',
    name: 'Automated Customer Support Deployment',
    description: 'Deploy comprehensive AI customer support system for growing business',
    suitable_agents: ['agent-002', 'agent-005', 'agent-010'],
    difficulty: 'Intermediate',
    focus_areas: ['Communication', 'Automation', 'Languages', 'Empathy']
  },
  {
    id: 'scenario-005',
    name: 'Innovation Lab Setup',
    description: 'Create R&D capabilities for breakthrough product development',
    suitable_agents: ['agent-007', 'agent-012', 'agent-006'],
    difficulty: 'Expert', 
    focus_areas: ['Innovation', 'Research', 'Creative Analysis', 'Algorithm Design']
  },
  {
    id: 'scenario-006',
    name: 'Global Expansion Planning',
    description: 'Multi-cultural expansion strategy for African and international markets',
    suitable_agents: ['agent-005', 'agent-006', 'agent-011', 'agent-013'],
    difficulty: 'Expert',
    focus_areas: ['Cultural Intelligence', 'Market Research', 'Strategic Planning', 'Trend Analysis']
  },
  {
    id: 'scenario-007',
    name: 'Operational Excellence Implementation',
    description: 'Transform business operations through AI-powered automation and optimization',
    suitable_agents: ['agent-004', 'agent-010', 'agent-011'],
    difficulty: 'Advanced',
    focus_areas: ['Operations', 'Automation', 'Process Improvement', 'Systems Integration']
  },
  {
    id: 'scenario-008',
    name: 'Creative Campaign Development',
    description: 'Develop breakthrough marketing campaigns that resonate with diverse audiences',
    suitable_agents: ['agent-003', 'agent-005', 'agent-012'],
    difficulty: 'Advanced',
    focus_areas: ['Creativity', 'Cultural Intelligence', 'Innovation Synthesis', 'Storytelling']
  }
];

// ============================================================================
// ENHANCEMENT SYSTEM
// ============================================================================

export const ENHANCEMENTS_DATA: Enhancement[] = [
  {
    id: 'enhance-001',
    name: 'Core Processor Upgrade',
    description: 'Boosts the learning rate for all skills by 5% during training simulations.',
    cost: 2,
    effect: { type: 'LEARNING_RATE', value: 0.05 }
  },
  {
    id: 'enhance-002',
    name: 'Analytical Specialization',
    description: 'Permanently increases the base "Analysis" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Analysis', value: 5 }
  },
  {
    id: 'enhance-003',
    name: 'Strategic Focus',
    description: 'Permanently increases the base "Strategy" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Strategy', value: 5 }
  },
  {
    id: 'enhance-004',
    name: 'Creative Intuition', 
    description: 'Permanently increases the base "Creativity" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Creativity', value: 5 }
  },
  {
    id: 'enhance-005',
    name: 'Neural Accelerator',
    description: 'Increases processing speed, reducing training time by 25% for all sessions.',
    cost: 3,
    effect: { type: 'LEARNING_RATE', value: 0.25 }
  },
  {
    id: 'enhance-006',
    name: 'Communication Mastery',
    description: 'Permanently increases the base "Communication" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Communication', value: 5 }
  },
  {
    id: 'enhance-007',
    name: 'Logic Circuit Optimization',
    description: 'Permanently increases the base "Logic" skill by 5 points.',
    cost: 1,
    effect: { type: 'SKILL_BOOST', skill: 'Logic', value: 5 }
  },
  {
    id: 'enhance-008',
    name: 'Multi-Agent Synchronization',
    description: 'Enables collaborative training sessions with other agents, boosting all skills by 3 points.',
    cost: 4,
    effect: { type: 'LEARNING_RATE', value: 0.15 }
  },
  {
    id: 'enhance-009',
    name: 'Quantum Processing Core',
    description: 'Advanced quantum computing capabilities. Permanently increases "Quantum Computing" skill by 10 points.',
    cost: 5,
    effect: { type: 'SKILL_BOOST', skill: 'Quantum Computing', value: 10 }
  },
  {
    id: 'enhance-010',
    name: 'Predictive Modeling Suite',
    description: 'Advanced forecasting capabilities. Permanently increases "Forecasting" and "Predictive Modeling" skills by 8 points.',
    cost: 4,
    effect: { type: 'SKILL_BOOST', skill: 'Predictive Modeling', value: 8 }
  },
  {
    id: 'enhance-011',
    name: 'Cross-Cultural Intelligence',
    description: 'Enhanced understanding of global markets. Increases "Cultural Intelligence" and "Global Marketing" by 6 points.',
    cost: 3,
    effect: { type: 'SKILL_BOOST', skill: 'Cultural Intelligence', value: 6 }
  },
  {
    id: 'enhance-012',
    name: 'Innovation Catalyst',
    description: 'Breakthrough ideation capabilities. Permanently increases "Innovation" and "Breakthrough Ideation" skills by 7 points.',
    cost: 3,
    effect: { type: 'SKILL_BOOST', skill: 'Innovation', value: 7 }
  },
  {
    id: 'enhance-013',
    name: 'Revenue Optimization Matrix',
    description: 'Specialized revenue analysis. Increases "Revenue Optimization" and "Market Intelligence" by 8 points.',
    cost: 4,
    effect: { type: 'SKILL_BOOST', skill: 'Revenue Optimization', value: 8 }
  },
  {
    id: 'enhance-014',
    name: 'South African Market Specialist',
    description: 'Deep understanding of SA business environment. Increases all SA-related skills by 6 points.',
    cost: 5,
    effect: { type: 'SKILL_BOOST', skill: 'SA Market Intelligence', value: 6 }
  },
  {
    id: 'enhance-015',
    name: 'Multi-Modal Processing',
    description: 'Advanced multi-modal AI capabilities for text, image, and data processing. Boosts all technical skills by 4 points.',
    cost: 6,
    effect: { type: 'SKILL_BOOST', skill: 'Technical Implementation', value: 4 }
  }
];

// ============================================================================
// SOVEREIGNTYOS INTEGRATION CONSTANTS
// ============================================================================

export const SOVEREIGNTYOS_AGENT_TIERS = {
  // Local Tier (Free, Fast)
  local: ['agent-002', 'agent-005'], // Aura, Kimi - Basic communication
  
  // Cheap Tier (Low-cost APIs)  
  cheap: ['agent-001', 'agent-003', 'agent-004', 'agent-006'], // Nexus-7, Helios, Orion, Perplexity
  
  // Premium Tier (Advanced capabilities)
  premium: ['agent-007', 'agent-008', 'agent-009', 'agent-011', 'agent-013'], // Z.AI, SIM AI, Kling AI, Qwen-3, Janus
  
  // Specialized Tier (Domain experts)
  specialized: ['agent-010', 'agent-012'] // Manus AI, Chimera
};

export const AGENT_COST_MATRIX = {
  'agent-001': 0.02, // Nexus-7 - Problem solving
  'agent-002': 0.01, // Aura - Conversation (local-first)
  'agent-003': 0.03, // Helios - Creative content
  'agent-004': 0.025, // Orion - Operations
  'agent-005': 0.015, // Kimi - Multilingual (local-optimized)
  'agent-006': 0.02, // Perplexity - Research
  'agent-007': 0.08, // Z.AI - Quantum computing (premium)
  'agent-008': 0.06, // SIM AI - Simulations (premium)
  'agent-009': 0.05, // Kling AI - Game theory (premium)
  'agent-010': 0.10, // Manus AI - Robotics (specialized)
  'agent-011': 0.07, // Qwen-3 - Complex reasoning (premium)
  'agent-012': 0.12, // Chimera - Hybrid specialist (specialized)
  'agent-013': 0.09  // Janus - Trend forecasting (premium)
};

// ============================================================================
// MULTI-AGENT COLLABORATION WORKFLOWS
// ============================================================================

export const COLLABORATION_WORKFLOWS = [
  {
    id: 'workflow-001',
    name: 'Complete Revenue Optimization',
    description: 'Multi-agent workflow for comprehensive revenue analysis and strategy',
    agents: ['agent-001', 'agent-008', 'agent-009', 'agent-013'], // Nexus-7, SIM AI, Kling AI, Janus
    sequence: [
      { agent: 'agent-001', task: 'Analyze current performance data' },
      { agent: 'agent-008', task: 'Model revenue scenarios and predictions' },
      { agent: 'agent-009', task: 'Develop strategic game plan' },
      { agent: 'agent-013', task: 'Forecast long-term market trends' }
    ],
    estimated_cost: 0.30,
    expected_duration: '5-8 minutes'
  },
  {
    id: 'workflow-002',
    name: 'Global Content Strategy',
    description: 'Multi-cultural content strategy development and optimization',
    agents: ['agent-003', 'agent-005', 'agent-012'], // Helios, Kimi, Chimera
    sequence: [
      { agent: 'agent-005', task: 'Analyze cultural preferences and languages' },
      { agent: 'agent-003', task: 'Generate creative content concepts' },
      { agent: 'agent-012', task: 'Synthesize data-driven creative strategy' }
    ],
    estimated_cost: 0.18,
    expected_duration: '3-5 minutes'
  },
  {
    id: 'workflow-003',
    name: 'Market Intelligence Suite',
    description: 'Comprehensive market analysis and competitive intelligence',
    agents: ['agent-006', 'agent-009', 'agent-013'], // Perplexity, Kling AI, Janus
    sequence: [
      { agent: 'agent-006', task: 'Research market conditions and competitors' },
      { agent: 'agent-013', task: 'Analyze historical trends and patterns' },
      { agent: 'agent-009', task: 'Develop strategic response plan' }
    ],
    estimated_cost: 0.16,
    expected_duration: '4-6 minutes'
  },
  {
    id: 'workflow-004',
    name: 'Innovation Pipeline Development',
    description: 'R&D workflow for breakthrough product/service innovation',
    agents: ['agent-007', 'agent-012', 'agent-006'], // Z.AI, Chimera, Perplexity
    sequence: [
      { agent: 'agent-006', task: 'Research cutting-edge technologies and trends' },
      { agent: 'agent-007', task: 'Apply quantum computing algorithms for optimization' },
      { agent: 'agent-012', task: 'Synthesize creative and analytical insights' }
    ],
    estimated_cost: 0.25,
    expected_duration: '6-10 minutes'
  }
];

// ============================================================================
// AGENT PERFORMANCE BENCHMARKS
// ============================================================================

export const AGENT_BENCHMARKS = {
  'agent-001': { // Nexus-7
    expertise_domains: ['Data Analysis', 'Problem Solving', 'Business Intelligence'],
    performance_metrics: { accuracy: 0.92, speed: 0.85, cost_efficiency: 0.88 },
    best_use_cases: ['Revenue analysis', 'Performance optimization', 'Data insights']
  },
  'agent-002': { // Aura  
    expertise_domains: ['Customer Support', 'Communication', 'Engagement'],
    performance_metrics: { accuracy: 0.89, speed: 0.95, cost_efficiency: 0.95 },
    best_use_cases: ['Customer service', 'Social media management', 'Community building']
  },
  'agent-003': { // Helios
    expertise_domains: ['Content Creation', 'Visual Design', 'Brand Strategy'],
    performance_metrics: { accuracy: 0.88, speed: 0.82, cost_efficiency: 0.85 },
    best_use_cases: ['Video scripts', 'Social media content', 'Creative campaigns']
  },
  'agent-004': { // Orion
    expertise_domains: ['Operations', 'Logistics', 'Process Optimization'],
    performance_metrics: { accuracy: 0.90, speed: 0.87, cost_efficiency: 0.89 },
    best_use_cases: ['Workflow optimization', 'Resource allocation', 'Efficiency analysis']
  },
  'agent-005': { // Kimi
    expertise_domains: ['Multilingual Communication', 'Cultural Analysis', 'Global Markets'],
    performance_metrics: { accuracy: 0.94, speed: 0.90, cost_efficiency: 0.92 },
    best_use_cases: ['Local market entry', 'Multilingual content', 'Cultural adaptation']
  },
  'agent-006': { // Perplexity
    expertise_domains: ['Research', 'Information Synthesis', 'Fact-Checking'],
    performance_metrics: { accuracy: 0.96, speed: 0.83, cost_efficiency: 0.87 },
    best_use_cases: ['Market research', 'Competitive analysis', 'Trend identification']
  },
  'agent-007': { // Z.AI
    expertise_domains: ['Quantum Computing', 'Advanced Algorithms', 'Mathematical Modeling'],
    performance_metrics: { accuracy: 0.95, speed: 0.75, cost_efficiency: 0.70 },
    best_use_cases: ['Complex optimization', 'Predictive modeling', 'Algorithm development']
  },
  'agent-008': { // SIM AI
    expertise_domains: ['Simulation', 'Predictive Modeling', 'Scenario Analysis'],
    performance_metrics: { accuracy: 0.93, speed: 0.78, cost_efficiency: 0.75 },
    best_use_cases: ['Revenue forecasting', 'Risk assessment', 'Scenario planning']
  },
  'agent-009': { // Kling AI
    expertise_domains: ['Game Theory', 'Strategic Planning', 'Competitive Strategy'],
    performance_metrics: { accuracy: 0.91, speed: 0.80, cost_efficiency: 0.78 },
    best_use_cases: ['Strategic planning', 'Competitive positioning', 'Market tactics']
  },
  'agent-010': { // Manus AI
    expertise_domains: ['Robotics', 'Automation', 'Technical Implementation'],
    performance_metrics: { accuracy: 0.89, speed: 0.85, cost_efficiency: 0.65 },
    best_use_cases: ['Process automation', 'Technical deployment', 'System integration']
  },
  'agent-011': { // Qwen-3
    expertise_domains: ['Complex Reasoning', 'Multi-Step Planning', 'Strategic Analysis'],
    performance_metrics: { accuracy: 0.94, speed: 0.82, cost_efficiency: 0.76 },
    best_use_cases: ['Strategic planning', 'Complex problem solving', 'Multi-step analysis']
  },
  'agent-012': { // Chimera
    expertise_domains: ['Creative Analysis', 'Innovation Synthesis', 'Cross-Domain Thinking'],
    performance_metrics: { accuracy: 0.90, speed: 0.77, cost_efficiency: 0.68 },
    best_use_cases: ['Innovation projects', 'Creative strategy', 'Breakthrough solutions']
  },
  'agent-013': { // Janus
    expertise_domains: ['Trend Forecasting', 'Historical Analysis', 'Market Evolution'],
    performance_metrics: { accuracy: 0.92, speed: 0.79, cost_efficiency: 0.72 },
    best_use_cases: ['Market forecasting', 'Trend analysis', 'Long-term strategy']
  }
};