// Supabase Integration Service for SovereigntyOS
const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl) {
            throw new Error('SUPABASE_URL environment variable is required');
        }

        // Service role client for backend operations
        this.serviceClient = createClient(
            this.supabaseUrl,
            this.supabaseServiceKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Public client for frontend operations
        this.publicClient = createClient(this.supabaseUrl, this.supabaseAnonKey);
        
        console.log('✅ Supabase service initialized');
    }

    // Workflow Management
    async createWorkflow(workflowData) {
        const { data, error } = await this.serviceClient
            .from('workflows')
            .insert([{
                name: workflowData.name,
                type: workflowData.type,
                status: 'idle',
                config: workflowData.config || {}
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getWorkflows() {
        const { data, error } = await this.serviceClient
            .from('workflows')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async updateWorkflowStatus(workflowName, status, lastRun = null) {
        const updateData = { 
            status, 
            updated_at: new Date().toISOString()
        };
        
        if (lastRun) {
            updateData.last_run = lastRun;
        }

        const { data, error } = await this.serviceClient
            .from('workflows')
            .update(updateData)
            .eq('name', workflowName)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Job Management
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
            .select()
            .single();

        if (error) throw error;
        
        // Emit real-time event
        await this.emitEvent('job_created', 'jobs', {
            jobId: data.id,
            workflowName: data.workflow_name,
            status: data.status
        });

        return data;
    }

    async updateJobStatus(jobId, status, progress = null, result = null, errorMessage = null) {
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        if (progress !== null) updateData.progress = progress;
        if (result !== null) updateData.result = result;
        if (errorMessage !== null) updateData.error_message = errorMessage;
        if (status === 'running' && !updateData.started_at) {
            updateData.started_at = new Date().toISOString();
        }
        if (status === 'completed' || status === 'failed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await this.serviceClient
            .from('jobs')
            .update(updateData)
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;

        // Emit real-time event
        await this.emitEvent('job_updated', 'jobs', {
            jobId: data.id,
            workflowName: data.workflow_name,
            status: data.status,
            progress: data.progress
        });

        return data;
    }

    async getJobsByWorkflow(workflowName, limit = 20) {
        const { data, error } = await this.serviceClient
            .from('jobs')
            .select('*')
            .eq('workflow_name', workflowName)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getRecentJobs(limit = 50) {
        const { data, error } = await this.serviceClient
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    // Cost Savings Tracking
    async logCostSavings(savingsData) {
        const { data, error } = await this.serviceClient
            .from('cost_savings')
            .insert([{
                task_type: savingsData.taskType,
                cloud_cost: savingsData.cloudCost,
                local_cost: savingsData.localCost,
                savings: savingsData.savings,
                duration_ms: savingsData.durationMs,
                model_used: savingsData.modelUsed,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Emit real-time cost savings event
        await this.emitEvent('cost_savings', 'localai', {
            taskType: savingsData.taskType,
            savings: savingsData.savings,
            totalSavings: await this.getTotalCostSavings()
        });

        return data;
    }

    async getTotalCostSavings() {
        const { data, error } = await this.serviceClient
            .from('cost_savings')
            .select('savings');

        if (error) throw error;
        
        return data.reduce((total, record) => total + parseFloat(record.savings), 0);
    }

    async getCostSavingsMetrics() {
        const { data: totalSavings, error: savingsError } = await this.serviceClient
            .rpc('sum', { column_name: 'savings', table_name: 'cost_savings' });

        const { data: localTasks, error: tasksError } = await this.serviceClient
            .from('cost_savings')
            .select('id', { count: 'exact', head: true });

        const { data: recentSavings, error: recentError } = await this.serviceClient
            .from('cost_savings')
            .select('*')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });

        if (savingsError || tasksError || recentError) {
            throw savingsError || tasksError || recentError;
        }

        const efficiency = recentSavings.length > 0 ? 
            (recentSavings.reduce((sum, s) => sum + parseFloat(s.savings), 0) / 
             recentSavings.reduce((sum, s) => sum + parseFloat(s.cloud_cost), 0)) * 100 : 0;

        return {
            totalSavings: totalSavings || 0,
            localTasks: localTasks || 0,
            efficiency: Math.round(efficiency * 10) / 10,
            recentSavings: recentSavings.slice(0, 10)
        };
    }

    // Manuscript Processing
    async createManuscript(manuscriptData) {
        const { data, error } = await this.serviceClient
            .from('manuscripts')
            .insert([{
                title: manuscriptData.title,
                content: manuscriptData.content,
                document_type: manuscriptData.documentType,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateManuscript(manuscriptId, updateData) {
        const { data, error } = await this.serviceClient
            .from('manuscripts')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
                processed_at: updateData.status === 'processed' ? new Date().toISOString() : null
            })
            .eq('id', manuscriptId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Real-time Events
    async emitEvent(eventType, source, data) {
        const { error } = await this.serviceClient
            .from('events')
            .insert([{
                event_type: eventType,
                source: source,
                data: data,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Failed to emit event:', error);
        }
    }

    // Settings Management
    async getSetting(key) {
        const { data, error } = await this.serviceClient
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data.value;
    }

    async setSetting(key, value, description = null) {
        const { data, error } = await this.serviceClient
            .from('settings')
            .upsert([{
                key: key,
                value: value,
                description: description,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Kill Switch
    async checkKillSwitch() {
        const killSwitchActive = await this.getSetting('kill_switch_armed');
        return killSwitchActive === true || killSwitchActive === 'true';
    }

    async activateKillSwitch(reason = 'Manual activation') {
        await this.setSetting('kill_switch_armed', true);
        await this.emitEvent('kill_switch_activated', 'system', {
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        // Stop all running jobs
        await this.serviceClient
            .from('jobs')
            .update({ 
                status: 'failed', 
                error_message: 'Kill switch activated',
                completed_at: new Date().toISOString()
            })
            .eq('status', 'running');

        console.log('🛑 Kill switch activated:', reason);
    }

    // Real-time Subscriptions (for frontend)
    subscribeToJobs(callback) {
        return this.publicClient
            .channel('jobs')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'jobs' },
                callback
            )
            .subscribe();
    }

    subscribeToWorkflows(callback) {
        return this.publicClient
            .channel('workflows')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'workflows' },
                callback
            )
            .subscribe();
    }

    subscribeToCostSavings(callback) {
        return this.publicClient
            .channel('cost_savings')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'cost_savings' },
                callback
            )
            .subscribe();
    }

    // Database Health Check
    async healthCheck() {
        try {
            const { data, error } = await this.serviceClient
                .from('settings')
                .select('count')
                .limit(1);

            if (error) throw error;

            return {
                status: 'healthy',
                connected: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Cleanup old records
    async cleanupOldRecords() {
        const retentionDays = await this.getSetting('job_retention_days') || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(retentionDays));

        // Clean up old completed jobs
        const { error: jobsError } = await this.serviceClient
            .from('jobs')
            .delete()
            .in('status', ['completed', 'failed'])
            .lt('completed_at', cutoffDate.toISOString());

        // Clean up old events (keep last 1000)
        const { data: oldEvents, error: eventsError } = await this.serviceClient
            .from('events')
            .select('id')
            .order('created_at', { ascending: false })
            .range(1000, 2000);

        if (oldEvents && oldEvents.length > 0) {
            const oldEventIds = oldEvents.map(e => e.id);
            await this.serviceClient
                .from('events')
                .delete()
                .in('id', oldEventIds);
        }

        if (jobsError || eventsError) {
            console.error('Cleanup errors:', { jobsError, eventsError });
        } else {
            console.log('✅ Database cleanup completed');
        }
    }
}

module.exports = SupabaseService;