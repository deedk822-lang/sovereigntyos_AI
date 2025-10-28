/**
 * @file Provides a dedicated service for all interactions with the Supabase backend.
 * This class abstracts away the direct Supabase client calls, offering a structured
 * and consistent API for managing workflows, jobs, settings, and other database entities.
 * It includes separate clients for backend (service role) and frontend (anon key) operations.
 */

const { createClient } = require('@supabase/supabase-js');

/**
 * A service class to manage all Supabase-related operations for the SovereigntyOS application.
 * It handles data persistence, real-time eventing, and system settings management.
 */
class SupabaseService {
    /**
     * Initializes the Supabase clients for both service-level and public access.
     * @throws {Error} If the required environment variables (SUPABASE_URL) are not set.
     */
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl) {
            throw new Error('SUPABASE_URL environment variable is required');
        }

        /**
         * Supabase client with service role privileges for secure backend operations.
         * Should never be exposed to the client-side.
         * @type {import('@supabase/supabase-js').SupabaseClient}
         */
        this.serviceClient = createClient(
            this.supabaseUrl,
            this.supabaseServiceKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        /**
         * Supabase client using the anonymous key, safe for use in the frontend.
         * Used for real-time subscriptions.
         * @type {import('@supabase/supabase-js').SupabaseClient}
         */
        this.publicClient = createClient(this.supabaseUrl, this.supabaseAnonKey);
        
        console.log('✅ Supabase service initialized');
    }

    // --- Workflow Management ---

    /**
     * Creates a new workflow record in the database.
     * @param {object} workflowData - The data for the new workflow.
     * @param {string} workflowData.name - The unique name of the workflow.
     * @param {string} workflowData.type - The category or type of the workflow.
     * @param {object} [workflowData.config={}] - Configuration object for the workflow.
     * @returns {Promise<object>} The newly created workflow object.
     * @throws {Error} If the database insertion fails.
     */
    async createWorkflow(workflowData) {
        const { data, error } = await this.serviceClient
            .from('workflows')
            .insert([{ name: workflowData.name, type: workflowData.type, status: 'idle', config: workflowData.config || {} }])
            .select().single();
        if (error) throw error;
        return data;
    }

    /**
     * Retrieves all workflow records from the database.
     * @returns {Promise<Array<object>>} A list of all workflows.
     * @throws {Error} If the database query fails.
     */
    async getWorkflows() {
        const { data, error } = await this.serviceClient.from('workflows').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    /**
     * Updates the status and last run time of a specific workflow.
     * @param {string} workflowName - The name of the workflow to update.
     * @param {string} status - The new status (e.g., 'running', 'idle').
     * @param {string} [lastRun=null] - The ISO string of the last run time.
     * @returns {Promise<object>} The updated workflow object.
     * @throws {Error} If the database update fails.
     */
    async updateWorkflowStatus(workflowName, status, lastRun = null) {
        const updateData = { status, updated_at: new Date().toISOString() };
        if (lastRun) updateData.last_run = lastRun;
        const { data, error } = await this.serviceClient.from('workflows').update(updateData).eq('name', workflowName).select().single();
        if (error) throw error;
        return data;
    }

    // --- Job Management ---

    /**
     * Creates a new job record in the database and emits a real-time event.
     * @param {object} jobData - The data for the new job.
     * @param {string} jobData.workflowName - The name of the parent workflow.
     * @param {string} [jobData.priority='normal'] - The job priority.
     * @param {object} [jobData.payload={}] - The input data for the job.
     * @returns {Promise<object>} The newly created job object.
     * @throws {Error} If the database insertion fails.
     */
    async createJob(jobData) {
        const { data, error } = await this.serviceClient
            .from('jobs')
            .insert([{
                workflow_name: jobData.workflowName,
                status: 'pending',
                priority: jobData.priority || 'normal',
                payload: jobData.payload || {},
                created_at: new Date().toISOString()
            }])
            .select().single();
        if (error) throw error;
        await this.emitEvent('job_created', 'jobs', { jobId: data.id, workflowName: data.workflow_name, status: data.status });
        return data;
    }

    /**
     * Updates the status, progress, and result of a job. Emits a real-time event.
     * @param {string} jobId - The ID of the job to update.
     * @param {string} status - The new status (e.g., 'running', 'completed', 'failed').
     * @param {number} [progress=null] - The completion percentage (0-100).
     * @param {object} [result=null] - The final result of the job.
     * @param {string} [errorMessage=null] - An error message if the job failed.
     * @returns {Promise<object>} The updated job object.
     * @throws {Error} If the database update fails.
     */
    async updateJobStatus(jobId, status, progress = null, result = null, errorMessage = null) {
        const updateData = { status, updated_at: new Date().toISOString() };
        if (progress !== null) updateData.progress = progress;
        if (result !== null) updateData.result = result;
        if (errorMessage !== null) updateData.error_message = errorMessage;
        if (status === 'running' && !updateData.started_at) updateData.started_at = new Date().toISOString();
        if (status === 'completed' || status === 'failed') updateData.completed_at = new Date().toISOString();

        const { data, error } = await this.serviceClient.from('jobs').update(updateData).eq('id', jobId).select().single();
        if (error) throw error;
        await this.emitEvent('job_updated', 'jobs', { jobId: data.id, workflowName: data.workflow_name, status: data.status, progress: data.progress });
        return data;
    }

    /**
     * Retrieves recent jobs for a specific workflow.
     * @param {string} workflowName - The name of the workflow.
     * @param {number} [limit=20] - The maximum number of jobs to return.
     * @returns {Promise<Array<object>>} A list of recent jobs.
     * @throws {Error} If the database query fails.
     */
    async getJobsByWorkflow(workflowName, limit = 20) {
        const { data, error } = await this.serviceClient.from('jobs').select('*').eq('workflow_name', workflowName).order('created_at', { ascending: false }).limit(limit);
        if (error) throw error;
        return data;
    }

    // --- Manuscript Processing ---

    /**
     * Creates a new manuscript record.
     * @param {object} manuscriptData - The data for the manuscript.
     * @param {string} manuscriptData.title - The title of the manuscript.
     * @param {string} manuscriptData.content - The full content of the manuscript.
     * @param {string} manuscriptData.documentType - The type of document.
     * @returns {Promise<object>} The created manuscript object.
     * @throws {Error} If the database insertion fails.
     */
    async createManuscript(manuscriptData) {
        const { data, error } = await this.serviceClient
            .from('manuscripts')
            .insert([{ title: manuscriptData.title, content: manuscriptData.content, document_type: manuscriptData.documentType, status: 'pending', created_at: new Date().toISOString() }])
            .select().single();
        if (error) throw error;
        return data;
    }

    /**
     * Updates an existing manuscript record with new data.
     * @param {string} manuscriptId - The ID of the manuscript to update.
     * @param {object} updateData - An object containing the fields to update.
     * @returns {Promise<object>} The updated manuscript object.
     * @throws {Error} If the database update fails.
     */
    async updateManuscript(manuscriptId, updateData) {
        const { data, error } = await this.serviceClient
            .from('manuscripts')
            .update({ ...updateData, updated_at: new Date().toISOString(), processed_at: updateData.status === 'processed' ? new Date().toISOString() : null })
            .eq('id', manuscriptId).select().single();
        if (error) throw error;
        return data;
    }

    // --- Real-time Events ---

    /**
     * Inserts a new event record into the `events` table.
     * @param {string} eventType - The type of the event (e.g., 'job_created').
     * @param {string} source - The source of the event (e.g., 'jobs', 'system').
     * @param {object} data - The JSON payload for the event.
     * @returns {Promise<void>}
     */
    async emitEvent(eventType, source, data) {
        const { error } = await this.serviceClient.from('events').insert([{ event_type: eventType, source, data, created_at: new Date().toISOString() }]);
        if (error) console.error('Failed to emit event:', error);
    }

    // --- Settings Management ---

    /**
     * Retrieves a setting value by its key.
     * @param {string} key - The key of the setting to retrieve.
     * @returns {Promise<any|null>} The value of the setting, or null if not found.
     * @throws {Error} If there's a database error other than 'not found'.
     */
    async getSetting(key) {
        const { data, error } = await this.serviceClient.from('settings').select('value').eq('key', key).single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data.value;
    }

    /**
     * Creates or updates a setting.
     * @param {string} key - The key of the setting.
     * @param {any} value - The value to set.
     * @param {string} [description=null] - A description for the setting.
     * @returns {Promise<object>} The upserted setting object.
     * @throws {Error} If the database upsert fails.
     */
    async setSetting(key, value, description = null) {
        const { data, error } = await this.serviceClient.from('settings').upsert([{ key, value, description, updated_at: new Date().toISOString() }]).select().single();
        if (error) throw error;
        return data;
    }

    // --- Kill Switch ---

    /**
     * Checks if the system-wide kill switch is active.
     * @returns {Promise<boolean>} `true` if the kill switch is armed, otherwise `false`.
     */
    async checkKillSwitch() {
        const killSwitchActive = await this.getSetting('kill_switch_armed');
        return killSwitchActive === true || killSwitchActive === 'true';
    }

    /**
     * Activates the kill switch, logs the reason, and stops all running jobs.
     * @param {string} [reason='Manual activation'] - The reason for activating the switch.
     * @returns {Promise<void>}
     */
    async activateKillSwitch(reason = 'Manual activation') {
        await this.setSetting('kill_switch_armed', true);
        await this.emitEvent('kill_switch_activated', 'system', { reason, timestamp: new Date().toISOString() });
        
        await this.serviceClient
            .from('jobs')
            .update({ status: 'failed', error_message: 'Kill switch activated', completed_at: new Date().toISOString() })
            .eq('status', 'running');

        console.log('🛑 Kill switch activated:', reason);
    }

    // --- Real-time Subscriptions (for frontend) ---

    /**
     * Subscribes to changes in the 'jobs' table.
     * @param {function} callback - The function to call with the payload on each change.
     * @returns {import('@supabase/realtime-js').RealtimeChannel} The subscribed channel.
     */
    subscribeToJobs(callback) {
        return this.publicClient.channel('jobs').on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, callback).subscribe();
    }

    /**
     * Subscribes to changes in the 'workflows' table.
     * @param {function} callback - The function to call with the payload on each change.
     * @returns {import('@supabase/realtime-js').RealtimeChannel} The subscribed channel.
     */
    subscribeToWorkflows(callback) {
        return this.publicClient.channel('workflows').on('postgres_changes', { event: '*', schema: 'public', table: 'workflows' }, callback).subscribe();
    }

    /**
     * Subscribes to new insertions in the 'cost_savings' table.
     * @param {function} callback - The function to call with the payload on each new record.
     * @returns {import('@supabase/realtime-js').RealtimeChannel} The subscribed channel.
     */
    subscribeToCostSavings(callback) {
        return this.publicClient.channel('cost_savings').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cost_savings' }, callback).subscribe();
    }

    // --- Maintenance ---

    /**
     * Performs a health check on the database connection.
     * @returns {Promise<object>} An object indicating the health status.
     */
    async healthCheck() {
        try {
            const { error } = await this.serviceClient.from('settings').select('count').limit(1);
            if (error) throw error;
            return { status: 'healthy', connected: true, timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'unhealthy', connected: false, error: error.message, timestamp: new Date().toISOString() };
        }
    }

    /**
     * Deletes old job and event records based on the configured retention period.
     * @returns {Promise<void>}
     */
    async cleanupOldRecords() {
        const retentionDays = await this.getSetting('job_retention_days') || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(retentionDays));

        const { error: jobsError } = await this.serviceClient.from('jobs').delete().in('status', ['completed', 'failed']).lt('completed_at', cutoffDate.toISOString());

        const { data: oldEvents, error: eventsError } = await this.serviceClient.from('events').select('id').order('created_at', { ascending: false }).range(1000, 2000);
        if (oldEvents && oldEvents.length > 0) {
            const oldEventIds = oldEvents.map(e => e.id);
            await this.serviceClient.from('events').delete().in('id', oldEventIds);
        }

        if (jobsError || eventsError) {
            console.error('Cleanup errors:', { jobsError, eventsError });
        } else {
            console.log('✅ Database cleanup completed');
        }
    }
}

module.exports = SupabaseService;