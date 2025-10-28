/**
 * @file Manages the lifecycle of AI-driven workflows, from registration and triggering to execution and cleanup.
 * This manager integrates with Supabase for persistent job and workflow state, and a local AI service for processing.
 * It handles concurrent job processing, progress tracking, and periodic maintenance tasks.
 */

const SupabaseService = require('./SupabaseService');
const LocalAIService = require('./LocalAIService');
const { v4: uuidv4 } = require('uuid');

/**
 * Orchestrates the execution of complex, multi-step AI workflows.
 * It maintains a registry of available workflows, processes a job queue,
 * and ensures system stability through features like a kill switch and concurrent job limits.
 */
class SovereignWorkflowManager {
    /**
     * Initializes the workflow manager, setting up dependencies and internal state.
     */
    constructor() {
        /**
         * Service for interacting with the Supabase backend.
         * @type {SupabaseService}
         */
        this.supabase = new SupabaseService();
        /**
         * Service for interacting with the local AI models.
         * @type {LocalAIService}
         */
        this.localAI = new LocalAIService();
        /**
         * A map of currently running jobs, keyed by job ID.
         * @type {Map<string, object>}
         */
        this.activeJobs = new Map();
        /**
         * The maximum number of jobs that can run concurrently.
         * @type {number}
         */
        this.maxConcurrentJobs = process.env.MAX_CONCURRENT_JOBS || 5;
        
        /**
         * A registry of available workflow functions, mapping workflow names to their implementation.
         * @type {Object.<string, Function>}
         */
        this.workflows = {
            'SovereignParliamentaryIntelligence': this.runParliamentaryIntelligence.bind(this),
            'SovereignCrisisResponse': this.runCrisisResponse.bind(this),
            'SovereignManuscriptService': this.runManuscriptService.bind(this)
        };
        
        console.log('🏛️ Sovereign Workflow Manager initialized');
    }

    /**
     * Performs asynchronous initialization tasks for the manager.
     * This includes checking the system kill switch, registering workflows in the database,
     * and starting background processes for job processing and cleanup.
     * @returns {Promise<void>}
     */
    async initialize() {
        const killSwitchActive = await this.supabase.checkKillSwitch();
        if (killSwitchActive) {
            console.log('🛑 Kill switch is active - workflows disabled');
            return;
        }

        await this.registerWorkflows();
        this.startJobProcessor();
        this.startPeriodicCleanup();
        
        console.log('✅ Workflow manager fully initialized');
    }

    /**
     * Registers predefined workflow configurations in the database.
     * If a workflow already exists, it is logged and skipped. This ensures the system
     * has a record of all available workflows and their default settings.
     * @private
     * @returns {Promise<void>}
     */
    async registerWorkflows() {
        const workflowConfigs = [
            {
                name: 'SovereignParliamentaryIntelligence',
                type: 'parliamentary',
                config: { model: 'sovereign-analysis', batch_size: 10, analysis_depth: 'comprehensive', generate_summaries: true }
            },
            {
                name: 'SovereignCrisisResponse',
                type: 'crisis',
                config: { alert_threshold: 0.8, notify_channels: ['email', 'sms', 'webhook'], escalation_levels: ['low', 'medium', 'high', 'critical'], auto_response: true }
            },
            {
                name: 'SovereignManuscriptService',
                type: 'manuscript',
                config: { auto_process: true, generate_embeddings: true, extract_metadata: true, enable_ocr: true }
            }
        ];

        for (const config of workflowConfigs) {
            try {
                await this.supabase.createWorkflow(config);
                console.log(`✅ Registered workflow: ${config.name}`);
            } catch (error) {
                if (error.code === '23505') { // Unique violation error code for PostgreSQL
                    console.log(`🔄 Workflow ${config.name} already exists`);
                } else {
                    console.error(`❌ Failed to register ${config.name}:`, error);
                }
            }
        }
    }

    /**
     * Triggers a new workflow job by creating a job record in the database.
     * The job will be picked up by the job processor.
     * @param {string} workflowName - The name of the workflow to trigger.
     * @param {object} [payload={}] - The data/input required for the workflow.
     * @param {string} [priority='normal'] - The priority of the job ('low', 'normal', 'high').
     * @returns {Promise<object>} The created job object from the database.
     * @throws {Error} If the kill switch is active or the workflow name is not found.
     */
    async triggerWorkflow(workflowName, payload = {}, priority = 'normal') {
        const killSwitchActive = await this.supabase.checkKillSwitch();
        if (killSwitchActive) {
            throw new Error('System is in kill switch mode - workflows disabled');
        }

        if (!this.workflows[workflowName]) {
            throw new Error(`Workflow ${workflowName} not found`);
        }

        const job = await this.supabase.createJob({ workflowName, payload, priority });
        console.log(`🚀 Triggered workflow: ${workflowName} (Job: ${job.id})`);
        return job;
    }

    /**
     * Starts a periodic interval to check for and process pending jobs.
     * @private
     */
    startJobProcessor() {
        setInterval(async () => {
            try {
                await this.processJobs();
            } catch (error) {
                console.error('Job processor error:', error);
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Fetches and processes pending jobs from the queue, up to the concurrent job limit.
     * @private
     * @returns {Promise<void>}
     */
    async processJobs() {
        if (this.activeJobs.size >= this.maxConcurrentJobs) {
            return;
        }

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

        for (const job of pendingJobs.data) {
            if (this.activeJobs.size >= this.maxConcurrentJobs) {
                break;
            }
            this.executeJob(job);
        }
    }

    /**
     * Manages the execution of a single job, including status updates and error handling.
     * @private
     * @param {object} job - The job object from the database.
     * @returns {Promise<void>}
     */
    async executeJob(job) {
        const jobId = job.id;
        this.activeJobs.set(jobId, job);

        try {
            await this.supabase.updateJobStatus(jobId, 'running', 0);
            console.log(`🔄 Executing job ${jobId}: ${job.workflow_name}`);
            
            const workflowFunction = this.workflows[job.workflow_name];
            if (!workflowFunction) {
                throw new Error(`Workflow function not found: ${job.workflow_name}`);
            }

            const result = await this.executeWithProgress(jobId, workflowFunction, job.payload);
            
            await this.supabase.updateJobStatus(jobId, 'completed', 100, result);
            console.log(`✅ Completed job ${jobId}: ${job.workflow_name}`);
            
        } catch (error) {
            console.error(`❌ Job ${jobId} failed:`, error);
            await this.supabase.updateJobStatus(jobId, 'failed', null, null, error.message);
        } finally {
            this.activeJobs.delete(jobId);
        }
    }

    /**
     * Wraps the execution of a workflow function to provide progress tracking.
     * @private
     * @param {string} jobId - The ID of the job being executed.
     * @param {Function} workflowFunction - The workflow function to execute.
     * @param {object} payload - The payload for the workflow function.
     * @returns {Promise<any>} The result of the workflow function.
     */
    async executeWithProgress(jobId, workflowFunction, payload) {
        const updateProgress = async (progress, message) => {
            await this.supabase.updateJobStatus(jobId, 'running', progress);
            if (message) {
                await this.supabase.emitEvent('job_progress', 'workflow', { jobId, progress, message });
            }
        };

        return await workflowFunction(payload, updateProgress);
    }

    /**
     * Workflow for analyzing parliamentary documents.
     * @private
     * @param {object} payload - The payload containing documents to analyze.
     * @param {Function} updateProgress - A callback to report progress.
     * @returns {Promise<object>} A report object with analysis results.
     */
    async runParliamentaryIntelligence(payload, updateProgress) {
        updateProgress(10, 'Initializing parliamentary analysis...');
        const documents = payload.documents || [];
        const results = [];
        
        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            const progress = Math.floor(10 + (i / documents.length) * 80);
            updateProgress(progress, `Analyzing document ${i + 1}/${documents.length}`);
            
            try {
                const analysis = await this.localAI.analyzeContent(document.content, 'parliamentary');
                const summary = await this.localAI.summarizeText(document.content, { maxTokens: 200, temperature: 0.2 });
                results.push({
                    document_id: document.id,
                    title: document.title,
                    analysis: analysis.choices[0].message.content,
                    summary: summary.choices[0].message.content,
                    insights: {
                        bill_impact: this.extractBillImpact(analysis),
                        voting_patterns: this.analyzeVotingPatterns(document.content),
                        policy_implications: this.extractPolicyImplications(analysis),
                        stakeholder_analysis: this.identifyStakeholders(document.content)
                    },
                    processed_at: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Failed to analyze document ${document.id}:`, error);
                results.push({ document_id: document.id, error: error.message, processed_at: new Date().toISOString() });
            }
        }
        
        updateProgress(95, 'Generating final report...');
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

    /**
     * Workflow for handling crisis response alerts.
     * @private
     * @param {object} payload - The payload containing crisis alert data.
     * @param {Function} updateProgress - A callback to report progress.
     * @returns {Promise<object>} A summary of the crisis response actions taken.
     */
    async runCrisisResponse(payload, updateProgress) {
        updateProgress(10, 'Initializing crisis response protocol...');
        const { alert_data, severity_level, notification_channels } = payload;
        
        updateProgress(20, 'Analyzing crisis severity...');
        const crisisAnalysis = await this.localAI.analyzeContent(alert_data.content, 'crisis');
        const severityScore = this.calculateSeverityScore(crisisAnalysis, alert_data);
        
        updateProgress(40, 'Determining response protocols...');
        const responseActions = this.determineResponseActions(severityScore, severity_level);
        
        updateProgress(60, 'Executing notifications...');
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

    /**
     * Workflow for processing and analyzing manuscripts.
     * @private
     * @param {object} payload - The payload containing manuscript content and metadata.
     * @param {Function} updateProgress - A callback to report progress.
     * @returns {Promise<object>} A summary of the manuscript processing results.
     */
    async runManuscriptService(payload, updateProgress) {
        updateProgress(10, 'Starting manuscript processing...');
        const { manuscript_id, content, document_type } = payload;
        
        const manuscript = await this.supabase.createManuscript({ title: payload.title || 'Untitled Document', content, documentType: document_type || 'general' });
        
        updateProgress(25, 'Generating summary...');
        const summary = await this.localAI.summarizeText(content, { maxTokens: 300, temperature: 0.2 });
        
        updateProgress(50, 'Performing content analysis...');
        const analysis = await this.localAI.analyzeContent(content, 'general');
        
        updateProgress(75, 'Generating embeddings...');
        const embeddings = await this.localAI.generateEmbeddings(content);
        
        updateProgress(90, 'Finalizing manuscript record...');
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

    // --- Helper Methods ---

    /** @private */
    extractBillImpact(analysis) {
        const content = analysis.choices[0].message.content.toLowerCase();
        const impacts = [];
        if (content.includes('budget') || content.includes('financial')) impacts.push('financial');
        if (content.includes('policy') || content.includes('regulation')) impacts.push('regulatory');
        if (content.includes('social') || content.includes('community')) impacts.push('social');
        return impacts;
    }

    /** @private */
    analyzeVotingPatterns(content) {
        const voteMatches = content.match(/\b(yes|no|abstain|aye|nay)\b/gi) || [];
        return { vote_mentions: voteMatches.length, likely_contentious: voteMatches.length > 10 };
    }

    /** @private */
    extractPolicyImplications(analysis) {
        const content = analysis.choices[0].message.content;
        return {
            complexity: content.length > 1000 ? 'high' : content.length > 500 ? 'medium' : 'low',
            urgency: content.toLowerCase().includes('urgent') ? 'high' : 'normal',
            scope: content.toLowerCase().includes('national') ? 'national' : 'regional'
        };
    }

    /** @private */
    identifyStakeholders(content) {
        const stakeholders = [];
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('citizen') || lowerContent.includes('public')) stakeholders.push('citizens');
        if (lowerContent.includes('business') || lowerContent.includes('industry')) stakeholders.push('business');
        if (lowerContent.includes('government') || lowerContent.includes('ministry')) stakeholders.push('government');
        return stakeholders;
    }

    /** @private */
    generateKeyFindings(results) {
        const successful = results.filter(r => !r.error);
        const findings = [];
        const allInsights = successful.flatMap(r => r.insights?.bill_impact || []);
        const impactCounts = {};
        allInsights.forEach(impact => { impactCounts[impact] = (impactCounts[impact] || 0) + 1; });
        findings.push(`Most common impact type: ${Object.keys(impactCounts)[0] || 'none'}`);
        findings.push(`Documents analyzed: ${successful.length}`);
        return findings;
    }

    /** @private */
    generateRecommendations(results) {
        return [
            'Continue monitoring parliamentary proceedings for policy changes',
            'Focus analysis on high-impact legislation',
            'Increase stakeholder engagement for contentious issues'
        ];
    }

    /** @private */
    calculateSeverityScore(analysis, alertData) {
        const content = analysis.choices[0].message.content.toLowerCase();
        let score = 0.5;
        if (content.includes('urgent') || content.includes('critical')) score += 0.3;
        if (content.includes('emergency') || content.includes('immediate')) score += 0.4;
        if (content.includes('threat') || content.includes('danger')) score += 0.2;
        return Math.min(score, 1.0);
    }

    /** @private */
    determineResponseActions(severityScore, severityLevel) {
        const actions = [];
        if (severityScore >= 0.8) {
            actions.push('Activate emergency protocols', 'Notify all stakeholders immediately', 'Prepare press statement');
        } else if (severityScore >= 0.6) {
            actions.push('Alert relevant departments', 'Schedule emergency meeting');
        } else {
            actions.push('Log for review', 'Monitor situation');
        }
        return actions;
    }

    /** @private */
    async sendCrisisNotification(channel, data) {
        console.log(`📢 Crisis notification via ${channel}:`, data);
        return { sent_at: new Date().toISOString(), channel };
    }

    /** @private */
    extractKeyTopics(analysisText) {
        const words = analysisText.toLowerCase().split(/\W+/);
        const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const wordCounts = {};
        words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        return Object.entries(wordCounts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([word]) => word);
    }

    /** @private */
    calculateProcessingCost(contentLength) {
        const baseRate = 0.001;
        return (contentLength / 1000) * baseRate;
    }

    /**
     * Starts a periodic interval to clean up old job records from the database.
     * @private
     */
    startPeriodicCleanup() {
        setInterval(async () => {
            try {
                await this.supabase.cleanupOldRecords();
                console.log('🧹 Periodic cleanup completed');
            } catch (error) {
                console.error('Cleanup failed:', error);
            }
        }, 24 * 60 * 60 * 1000); // Run every 24 hours
    }

    // --- Public API Methods ---

    /**
     * Retrieves the status of a specific workflow, including its configuration and recent job history.
     * @param {string} workflowName - The name of the workflow to query.
     * @returns {Promise<object>} An object containing the workflow status.
     * @throws {Error} If the workflow name is not found.
     */
    async getWorkflowStatus(workflowName) {
        const workflows = await this.supabase.getWorkflows();
        const workflow = workflows.find(w => w.name === workflowName);
        if (!workflow) throw new Error(`Workflow ${workflowName} not found`);
        
        const recentJobs = await this.supabase.getJobsByWorkflow(workflowName, 10);
        return {
            ...workflow,
            recent_jobs: recentJobs,
            active_jobs: Array.from(this.activeJobs.values()).filter(job => job.workflow_name === workflowName)
        };
    }

    /**
     * Retrieves the status of all registered workflows.
     * @returns {Promise<Array<object>>} A list of workflow status objects.
     */
    async getAllWorkflowStatuses() {
        const workflows = await this.supabase.getWorkflows();
        const statuses = [];
        for (const workflow of workflows) {
            const status = await this.getWorkflowStatus(workflow.name);
            statuses.push(status);
        }
        return statuses;
    }

    /**
     * Retrieves the status of a single job.
     * @param {string} workflowName - The name of the workflow the job belongs to.
     * @param {string} jobId - The ID of the job to retrieve.
     * @returns {Promise<object>} The job object.
     * @throws {Error} If the job is not found.
     */
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