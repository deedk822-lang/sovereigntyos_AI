// Sovereign Workflow Manager with Supabase Integration
const SupabaseService = require('./SupabaseService');
const LocalAIService = require('./LocalAIService');
const { v4: uuidv4 } = require('uuid');

class SovereignWorkflowManager {
    constructor() {
        this.supabase = new SupabaseService();
        this.localAI = new LocalAIService();
        this.activeJobs = new Map();
        this.maxConcurrentJobs = process.env.MAX_CONCURRENT_JOBS || 5;
        
        this.workflows = {
            'SovereignParliamentaryIntelligence': this.runParliamentaryIntelligence.bind(this),
            'SovereignCrisisResponse': this.runCrisisResponse.bind(this),
            'SovereignManuscriptService': this.runManuscriptService.bind(this)
        };
        
        console.log('🏛️ Sovereign Workflow Manager initialized');
    }

    async initialize() {
        // Check kill switch on startup
        const killSwitchActive = await this.supabase.checkKillSwitch();
        if (killSwitchActive) {
            console.log('🛑 Kill switch is active - workflows disabled');
            return;
        }

        // Register workflows in database
        await this.registerWorkflows();
        
        // Start job processor
        this.startJobProcessor();
        
        // Start periodic cleanup
        this.startPeriodicCleanup();
        
        console.log('✅ Workflow manager fully initialized');
    }

    async registerWorkflows() {
        const workflowConfigs = [
            {
                name: 'SovereignParliamentaryIntelligence',
                type: 'parliamentary',
                config: {
                    model: 'sovereign-analysis',
                    batch_size: 10,
                    analysis_depth: 'comprehensive',
                    generate_summaries: true
                }
            },
            {
                name: 'SovereignCrisisResponse',
                type: 'crisis',
                config: {
                    alert_threshold: 0.8,
                    notify_channels: ['email', 'sms', 'webhook'],
                    escalation_levels: ['low', 'medium', 'high', 'critical'],
                    auto_response: true
                }
            },
            {
                name: 'SovereignManuscriptService',
                type: 'manuscript',
                config: {
                    auto_process: true,
                    generate_embeddings: true,
                    extract_metadata: true,
                    enable_ocr: true
                }
            }
        ];

        for (const config of workflowConfigs) {
            try {
                await this.supabase.createWorkflow(config);
                console.log(`✅ Registered workflow: ${config.name}`);
            } catch (error) {
                if (error.code === '23505') {
                    // Workflow already exists, update config
                    console.log(`🔄 Workflow ${config.name} already exists`);
                } else {
                    console.error(`❌ Failed to register ${config.name}:`, error);
                }
            }
        }
    }

    async triggerWorkflow(workflowName, payload = {}, priority = 'normal') {
        // Check kill switch
        const killSwitchActive = await this.supabase.checkKillSwitch();
        if (killSwitchActive) {
            throw new Error('System is in kill switch mode - workflows disabled');
        }

        // Check if workflow exists
        if (!this.workflows[workflowName]) {
            throw new Error(`Workflow ${workflowName} not found`);
        }

        // Create job in database
        const job = await this.supabase.createJob({
            workflowName,
            payload,
            priority
        });

        console.log(`🚀 Triggered workflow: ${workflowName} (Job: ${job.id})`);
        return job;
    }

    startJobProcessor() {
        setInterval(async () => {
            try {
                await this.processJobs();
            } catch (error) {
                console.error('Job processor error:', error);
            }
        }, 5000); // Check every 5 seconds
    }

    async processJobs() {
        // Check if we're at capacity
        if (this.activeJobs.size >= this.maxConcurrentJobs) {
            return;
        }

        // Get pending jobs
        const pendingJobs = await this.supabase.serviceClient
            .from('jobs')
            .select('*')
            .eq('status', 'pending')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(this.maxConcurrentJobs - this.activeJobs.size);

        if (pendingJobs.error || !pendingJobs.data.length) {
            return;
        }

        // Process each job
        for (const job of pendingJobs.data) {
            if (this.activeJobs.size >= this.maxConcurrentJobs) {
                break;
            }
            
            this.executeJob(job);
        }
    }

    async executeJob(job) {
        const jobId = job.id;
        this.activeJobs.set(jobId, job);

        try {
            // Update job status to running
            await this.supabase.updateJobStatus(jobId, 'running', 0);
            
            console.log(`🔄 Executing job ${jobId}: ${job.workflow_name}`);
            
            // Get workflow function
            const workflowFunction = this.workflows[job.workflow_name];
            if (!workflowFunction) {
                throw new Error(`Workflow function not found: ${job.workflow_name}`);
            }

            // Execute workflow with progress tracking
            const result = await this.executeWithProgress(jobId, workflowFunction, job.payload);
            
            // Update job as completed
            await this.supabase.updateJobStatus(jobId, 'completed', 100, result);
            
            console.log(`✅ Completed job ${jobId}: ${job.workflow_name}`);
            
        } catch (error) {
            console.error(`❌ Job ${jobId} failed:`, error);
            
            await this.supabase.updateJobStatus(
                jobId, 
                'failed', 
                null, 
                null, 
                error.message
            );
        } finally {
            this.activeJobs.delete(jobId);
        }
    }

    async executeWithProgress(jobId, workflowFunction, payload) {
        const updateProgress = async (progress, message) => {
            await this.supabase.updateJobStatus(jobId, 'running', progress);
            if (message) {
                await this.supabase.emitEvent('job_progress', 'workflow', {
                    jobId,
                    progress,
                    message
                });
            }
        };

        // Execute workflow with progress callback
        return await workflowFunction(payload, updateProgress);
    }

    // Parliamentary Intelligence Workflow
    async runParliamentaryIntelligence(payload, updateProgress) {
        updateProgress(10, 'Initializing parliamentary analysis...');
        
        const documents = payload.documents || [];
        const results = [];
        
        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            const progress = Math.floor(10 + (i / documents.length) * 80);
            
            updateProgress(progress, `Analyzing document ${i + 1}/${documents.length}`);
            
            try {
                // Use LocalAI for cost-effective analysis
                const analysis = await this.localAI.analyzeContent(document.content, 'parliamentary');
                const summary = await this.localAI.summarizeText(document.content, {
                    maxTokens: 200,
                    temperature: 0.2
                });
                
                // Extract key parliamentary insights
                const insights = {
                    bill_impact: this.extractBillImpact(analysis),
                    voting_patterns: this.analyzeVotingPatterns(document.content),
                    policy_implications: this.extractPolicyImplications(analysis),
                    stakeholder_analysis: this.identifyStakeholders(document.content)
                };
                
                results.push({
                    document_id: document.id,
                    title: document.title,
                    analysis: analysis.choices[0].message.content,
                    summary: summary.choices[0].message.content,
                    insights,
                    processed_at: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`Failed to analyze document ${document.id}:`, error);
                results.push({
                    document_id: document.id,
                    error: error.message,
                    processed_at: new Date().toISOString()
                });
            }
        }
        
        updateProgress(95, 'Generating final report...');
        
        // Generate comprehensive parliamentary report
        const report = {
            summary: {
                total_documents: documents.length,
                successful_analyses: results.filter(r => !r.error).length,
                failed_analyses: results.filter(r => r.error).length
            },
            key_findings: this.generateKeyFindings(results),
            recommendations: this.generateRecommendations(results),
            detailed_results: results,
            generated_at: new Date().toISOString()
        };
        
        updateProgress(100, 'Parliamentary intelligence analysis complete');
        return report;
    }

    // Crisis Response Workflow
    async runCrisisResponse(payload, updateProgress) {
        updateProgress(10, 'Initializing crisis response protocol...');
        
        const { alert_data, severity_level, notification_channels } = payload;
        
        updateProgress(20, 'Analyzing crisis severity...');
        
        // Analyze crisis using LocalAI
        const crisisAnalysis = await this.localAI.analyzeContent(alert_data.content, 'crisis');
        const severityScore = this.calculateSeverityScore(crisisAnalysis, alert_data);
        
        updateProgress(40, 'Determining response protocols...');
        
        // Determine response actions based on severity
        const responseActions = this.determineResponseActions(severityScore, severity_level);
        
        updateProgress(60, 'Executing notifications...');
        
        // Execute notifications
        const notificationResults = [];
        for (const channel of notification_channels || ['email']) {
            try {
                const result = await this.sendCrisisNotification(channel, {
                    severity: severityScore,
                    analysis: crisisAnalysis.choices[0].message.content,
                    actions: responseActions,
                    timestamp: new Date().toISOString()
                });
                notificationResults.push({ channel, status: 'sent', result });
            } catch (error) {
                notificationResults.push({ channel, status: 'failed', error: error.message });
            }
        }
        
        updateProgress(80, 'Logging crisis response...');
        
        // Log crisis response in database
        const crisisRecord = {
            alert_id: alert_data.id || uuidv4(),
            severity_score: severityScore,
            analysis: crisisAnalysis.choices[0].message.content,
            response_actions: responseActions,
            notifications: notificationResults,
            resolved: false,
            created_at: new Date().toISOString()
        };
        
        updateProgress(100, 'Crisis response protocol completed');
        
        return {
            crisis_id: crisisRecord.alert_id,
            severity: severityScore,
            actions_taken: responseActions.length,
            notifications_sent: notificationResults.filter(n => n.status === 'sent').length,
            response_time_ms: Date.now() - new Date(alert_data.timestamp).getTime(),
            full_record: crisisRecord
        };
    }

    // Manuscript Service Workflow
    async runManuscriptService(payload, updateProgress) {
        updateProgress(10, 'Starting manuscript processing...');
        
        const { manuscript_id, content, document_type } = payload;
        
        // Create manuscript record
        const manuscript = await this.supabase.createManuscript({
            title: payload.title || 'Untitled Document',
            content,
            documentType: document_type || 'general'
        });
        
        updateProgress(25, 'Generating summary...');
        
        // Generate summary using LocalAI
        const summary = await this.localAI.summarizeText(content, {
            maxTokens: 300,
            temperature: 0.2
        });
        
        updateProgress(50, 'Performing content analysis...');
        
        // Analyze content
        const analysis = await this.localAI.analyzeContent(content, 'general');
        
        updateProgress(75, 'Generating embeddings...');
        
        // Generate embeddings for semantic search
        const embeddings = await this.localAI.generateEmbeddings(content);
        
        updateProgress(90, 'Finalizing manuscript record...');
        
        // Update manuscript with processed data
        const processedManuscript = await this.supabase.updateManuscript(manuscript.id, {
            summary: summary.choices[0].message.content,
            analysis: {
                content_analysis: analysis.choices[0].message.content,
                word_count: content.split(/\s+/).length,
                estimated_reading_time: Math.ceil(content.split(/\s+/).length / 200),
                key_topics: this.extractKeyTopics(analysis.choices[0].message.content)
            },
            status: 'processed',
            processing_cost: this.calculateProcessingCost(content.length)
        });
        
        updateProgress(100, 'Manuscript processing complete');
        
        return {
            manuscript_id: processedManuscript.id,
            word_count: processedManuscript.analysis.word_count,
            summary_length: summary.choices[0].message.content.length,
            processing_cost: processedManuscript.processing_cost,
            embeddings_generated: embeddings.data.length > 0,
            processed_at: processedManuscript.processed_at
        };
    }

    // Helper Methods
    extractBillImpact(analysis) {
        // Extract bill impact indicators from analysis
        const content = analysis.choices[0].message.content.toLowerCase();
        const impacts = [];
        
        if (content.includes('budget') || content.includes('financial')) {
            impacts.push('financial');
        }
        if (content.includes('policy') || content.includes('regulation')) {
            impacts.push('regulatory');
        }
        if (content.includes('social') || content.includes('community')) {
            impacts.push('social');
        }
        
        return impacts;
    }

    analyzeVotingPatterns(content) {
        // Simple voting pattern analysis
        const voteMatches = content.match(/\b(yes|no|abstain|aye|nay)\b/gi) || [];
        return {
            vote_mentions: voteMatches.length,
            likely_contentious: voteMatches.length > 10
        };
    }

    extractPolicyImplications(analysis) {
        const content = analysis.choices[0].message.content;
        return {
            complexity: content.length > 1000 ? 'high' : content.length > 500 ? 'medium' : 'low',
            urgency: content.toLowerCase().includes('urgent') ? 'high' : 'normal',
            scope: content.toLowerCase().includes('national') ? 'national' : 'regional'
        };
    }

    identifyStakeholders(content) {
        const stakeholders = [];
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes('citizen') || lowerContent.includes('public')) {
            stakeholders.push('citizens');
        }
        if (lowerContent.includes('business') || lowerContent.includes('industry')) {
            stakeholders.push('business');
        }
        if (lowerContent.includes('government') || lowerContent.includes('ministry')) {
            stakeholders.push('government');
        }
        
        return stakeholders;
    }

    generateKeyFindings(results) {
        const successful = results.filter(r => !r.error);
        const findings = [];
        
        // Aggregate insights
        const allInsights = successful.flatMap(r => r.insights?.bill_impact || []);
        const impactCounts = {};
        allInsights.forEach(impact => {
            impactCounts[impact] = (impactCounts[impact] || 0) + 1;
        });
        
        findings.push(`Most common impact type: ${Object.keys(impactCounts)[0] || 'none'}`);
        findings.push(`Documents analyzed: ${successful.length}`);
        
        return findings;
    }

    generateRecommendations(results) {
        return [
            'Continue monitoring parliamentary proceedings for policy changes',
            'Focus analysis on high-impact legislation',
            'Increase stakeholder engagement for contentious issues'
        ];
    }

    calculateSeverityScore(analysis, alertData) {
        const content = analysis.choices[0].message.content.toLowerCase();
        let score = 0.5; // Base score
        
        // Keywords that increase severity
        if (content.includes('urgent') || content.includes('critical')) score += 0.3;
        if (content.includes('emergency') || content.includes('immediate')) score += 0.4;
        if (content.includes('threat') || content.includes('danger')) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    determineResponseActions(severityScore, severityLevel) {
        const actions = [];
        
        if (severityScore >= 0.8) {
            actions.push('Activate emergency protocols');
            actions.push('Notify all stakeholders immediately');
            actions.push('Prepare press statement');
        } else if (severityScore >= 0.6) {
            actions.push('Alert relevant departments');
            actions.push('Schedule emergency meeting');
        } else {
            actions.push('Log for review');
            actions.push('Monitor situation');
        }
        
        return actions;
    }

    async sendCrisisNotification(channel, data) {
        // Implement actual notification logic based on channel
        console.log(`📢 Crisis notification via ${channel}:`, data);
        return { sent_at: new Date().toISOString(), channel };
    }

    extractKeyTopics(analysisText) {
        // Simple keyword extraction
        const words = analysisText.toLowerCase().split(/\W+/);
        const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const wordCounts = {};
        
        words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        
        return Object.entries(wordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    calculateProcessingCost(contentLength) {
        // Estimate processing cost based on content length
        const baseRate = 0.001; // $0.001 per 1000 characters
        return (contentLength / 1000) * baseRate;
    }

    startPeriodicCleanup() {
        // Run cleanup every 24 hours
        setInterval(async () => {
            try {
                await this.supabase.cleanupOldRecords();
                console.log('🧹 Periodic cleanup completed');
            } catch (error) {
                console.error('Cleanup failed:', error);
            }
        }, 24 * 60 * 60 * 1000);
    }

    // API Methods
    async getWorkflowStatus(workflowName) {
        const workflows = await this.supabase.getWorkflows();
        const workflow = workflows.find(w => w.name === workflowName);
        
        if (!workflow) {
            throw new Error(`Workflow ${workflowName} not found`);
        }
        
        const recentJobs = await this.supabase.getJobsByWorkflow(workflowName, 10);
        
        return {
            ...workflow,
            recent_jobs: recentJobs,
            active_jobs: Array.from(this.activeJobs.values())
                .filter(job => job.workflow_name === workflowName)
        };
    }

    async getAllWorkflowStatuses() {
        const workflows = await this.supabase.getWorkflows();
        const statuses = [];
        
        for (const workflow of workflows) {
            const status = await this.getWorkflowStatus(workflow.name);
            statuses.push(status);
        }
        
        return statuses;
    }

    async getJobStatus(workflowName, jobId) {
        const { data, error } = await this.supabase.serviceClient
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .eq('workflow_name', workflowName)
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = SovereignWorkflowManager;