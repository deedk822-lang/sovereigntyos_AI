-- SovereigntyOS Supabase Database Setup Script
-- Run this script in your Supabase SQL Editor
-- Project: https://frimqirycmnlpyfysfqf.supabase.co

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop existing tables if they exist (use with caution in production)
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS cost_savings CASCADE;
-- DROP TABLE IF EXISTS manuscripts CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS workflows CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL, -- 'parliamentary', 'crisis', 'manuscript'
    status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'running', 'completed', 'failed'
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    description TEXT
);

-- Create jobs table for workflow execution tracking
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    payload JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- 0-100
    estimated_completion TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    cost_usd DECIMAL(10,4) DEFAULT 0
);

-- Create cost savings tracking for LocalAI
CREATE TABLE IF NOT EXISTS cost_savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type VARCHAR(100) NOT NULL, -- 'summarization', 'embeddings', 'analysis', 'code-generation'
    cloud_cost DECIMAL(10,4) NOT NULL,
    local_cost DECIMAL(10,4) NOT NULL,
    savings DECIMAL(10,4) NOT NULL,
    duration_ms INTEGER NOT NULL,
    model_used VARCHAR(255),
    tokens_processed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL
);

-- Create manuscripts processing table
CREATE TABLE IF NOT EXISTS manuscripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    summary TEXT,
    analysis JSONB DEFAULT '{}',
    embeddings VECTOR(384), -- For semantic search (sentence-transformers/all-MiniLM-L6-v2)
    document_type VARCHAR(100), -- 'bill', 'report', 'transcript', 'policy', 'general'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'processed', 'archived', 'failed'
    processing_cost DECIMAL(10,4) DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system events for real-time streaming
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'job_created', 'job_updated', 'cost_savings', 'kill_switch_activated'
    source VARCHAR(100) NOT NULL, -- 'jobs', 'workflows', 'localai', 'system'
    data JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT NULL,
    processed BOOLEAN DEFAULT FALSE
);

-- Create user management table (optional)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer', -- 'admin', 'operator', 'viewer'
    permissions JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- 'general', 'security', 'ai', 'costs', 'notifications'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create crisis response logs
CREATE TABLE IF NOT EXISTS crisis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(255) NOT NULL,
    severity_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    analysis TEXT,
    response_actions JSONB DEFAULT '[]',
    notifications JSONB DEFAULT '[]',
    resolved BOOLEAN DEFAULT FALSE,
    resolution_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parliamentary analysis table
CREATE TABLE IF NOT EXISTS parliamentary_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    document_title VARCHAR(500),
    bill_number VARCHAR(100),
    analysis_type VARCHAR(100), -- 'bill_impact', 'voting_pattern', 'policy_implication'
    findings JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    stakeholders JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(type);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

CREATE INDEX IF NOT EXISTS idx_jobs_workflow_name ON jobs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON jobs(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cost_savings_task_type ON cost_savings(task_type);
CREATE INDEX IF NOT EXISTS idx_cost_savings_created_at ON cost_savings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_savings_savings ON cost_savings(savings DESC);

CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON manuscripts(status);
CREATE INDEX IF NOT EXISTS idx_manuscripts_document_type ON manuscripts(document_type);
CREATE INDEX IF NOT EXISTS idx_manuscripts_created_at ON manuscripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manuscripts_embeddings ON manuscripts USING ivfflat (embeddings vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);

CREATE INDEX IF NOT EXISTS idx_crisis_logs_alert_id ON crisis_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_severity ON crisis_logs(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_resolved ON crisis_logs(resolved);

CREATE INDEX IF NOT EXISTS idx_parliamentary_analyses_type ON parliamentary_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_parliamentary_analyses_confidence ON parliamentary_analyses(confidence_score DESC);

-- Insert default workflows
INSERT INTO workflows (name, type, status, config, description) VALUES
('SovereignParliamentaryIntelligence', 'parliamentary', 'idle', 
 '{
    "model": "sovereign-analysis",
    "batch_size": 10,
    "analysis_depth": "comprehensive",
    "generate_summaries": true,
    "extract_voting_patterns": true,
    "identify_stakeholders": true
 }',
 'Comprehensive analysis of parliamentary proceedings, bills, and policy documents'
),
('SovereignCrisisResponse', 'crisis', 'idle', 
 '{
    "alert_threshold": 0.8,
    "notify_channels": ["email", "sms", "webhook"],
    "escalation_levels": ["low", "medium", "high", "critical"],
    "auto_response": true,
    "max_response_time_minutes": 5
 }',
 'Real-time crisis detection, analysis, and automated response coordination'
),
('SovereignManuscriptService', 'manuscript', 'idle', 
 '{
    "auto_process": true,
    "generate_embeddings": true,
    "extract_metadata": true,
    "enable_ocr": true,
    "supported_formats": ["pdf", "docx", "txt", "md"],
    "max_file_size_mb": 50
 }',
 'Document processing, summarization, analysis, and semantic search indexing'
)
ON CONFLICT (name) DO UPDATE SET 
    config = EXCLUDED.config,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert system settings
INSERT INTO settings (key, value, description, category) VALUES
('cost_optimization_enabled', 'true', 'Enable LocalAI cost optimization for routine tasks', 'ai'),
('localai_fallback_enabled', 'true', 'Fall back to cloud APIs when LocalAI unavailable', 'ai'),
('kill_switch_armed', 'true', 'Emergency kill switch status - can stop all workflows', 'security'),
('max_concurrent_jobs', '10', 'Maximum concurrent job executions', 'general'),
('job_retention_days', '30', 'Days to keep completed job records', 'general'),
('cost_savings_target_monthly', '1000.00', 'Monthly cost savings target in USD', 'costs'),
('notification_channels', '["email", "webhook"]', 'Default notification channels for alerts', 'notifications'),
('security_audit_enabled', 'true', 'Enable security audit logging', 'security'),
('real_time_monitoring', 'true', 'Enable real-time system monitoring', 'general'),
('auto_cleanup_enabled', 'true', 'Enable automatic cleanup of old records', 'general'),
('parliamentary_analysis_auto', 'true', 'Automatically analyze new parliamentary documents', 'ai'),
('crisis_response_auto', 'true', 'Enable automatic crisis response protocols', 'security'),
('manuscript_auto_process', 'true', 'Automatically process uploaded manuscripts', 'ai'),
('system_status', 'operational', 'Current system operational status', 'general'),
('last_health_check', 'null', 'Timestamp of last system health check', 'general')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Enable Row Level Security (RLS)
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parliamentary_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role access (backend operations)
DROP POLICY IF EXISTS "Service role full access" ON workflows;
CREATE POLICY "Service role full access" ON workflows 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON jobs;
CREATE POLICY "Service role full access" ON jobs 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON cost_savings;
CREATE POLICY "Service role full access" ON cost_savings 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON manuscripts;
CREATE POLICY "Service role full access" ON manuscripts 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON events;
CREATE POLICY "Service role full access" ON events 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON settings;
CREATE POLICY "Service role full access" ON settings 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON users;
CREATE POLICY "Service role full access" ON users 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON crisis_logs;
CREATE POLICY "Service role full access" ON crisis_logs 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON parliamentary_analyses;
CREATE POLICY "Service role full access" ON parliamentary_analyses 
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for authenticated users (read access)
DROP POLICY IF EXISTS "Authenticated read access" ON workflows;
CREATE POLICY "Authenticated read access" ON workflows 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read access" ON jobs;
CREATE POLICY "Authenticated read access" ON jobs 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read access" ON cost_savings;
CREATE POLICY "Authenticated read access" ON cost_savings 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read access" ON manuscripts;
CREATE POLICY "Authenticated read access" ON manuscripts 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read access" ON events;
CREATE POLICY "Authenticated read access" ON events 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for real-time subscriptions
CREATE OR REPLACE FUNCTION notify_job_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('job_changes', 
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW),
            'old_record', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END
        )::text
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time notifications
DROP TRIGGER IF EXISTS job_changes_trigger ON jobs;
CREATE TRIGGER job_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION notify_job_changes();

-- Create function to calculate total cost savings
CREATE OR REPLACE FUNCTION get_total_cost_savings()
RETURNS DECIMAL(10,4) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(savings) FROM cost_savings),
        0.00
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to get system metrics
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_jobs', (SELECT COUNT(*) FROM jobs),
        'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'running'),
        'completed_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'completed'),
        'failed_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'failed'),
        'total_cost_savings', get_total_cost_savings(),
        'total_manuscripts', (SELECT COUNT(*) FROM manuscripts),
        'active_workflows', (SELECT COUNT(*) FROM workflows WHERE status != 'idle'),
        'system_uptime', EXTRACT(EPOCH FROM (NOW() - (SELECT created_at FROM workflows ORDER BY created_at LIMIT 1))),
        'last_updated', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function for health check
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS JSON AS $$
DECLARE
    kill_switch_status BOOLEAN;
    active_jobs_count INTEGER;
    failed_jobs_rate DECIMAL;
    result JSON;
BEGIN
    -- Get kill switch status
    SELECT (value::boolean) INTO kill_switch_status 
    FROM settings WHERE key = 'kill_switch_armed';
    
    -- Get active jobs
    SELECT COUNT(*) INTO active_jobs_count 
    FROM jobs WHERE status = 'running';
    
    -- Calculate failure rate (last 24 hours)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE status = 'failed')::DECIMAL / COUNT(*)) * 100
        END
    INTO failed_jobs_rate
    FROM jobs 
    WHERE created_at >= NOW() - INTERVAL '24 hours';
    
    SELECT json_build_object(
        'status', CASE 
            WHEN kill_switch_status THEN 'kill_switch_active'
            WHEN failed_jobs_rate > 50 THEN 'degraded'
            WHEN active_jobs_count > 20 THEN 'high_load'
            ELSE 'healthy'
        END,
        'kill_switch_armed', kill_switch_status,
        'active_jobs', active_jobs_count,
        'failure_rate_24h', failed_jobs_rate,
        'database_connected', true,
        'timestamp', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert initial admin user (optional)
-- INSERT INTO users (email, role, permissions) VALUES 
-- ('admin@sovereigntyos.com', 'admin', '{"all": true}');

-- Update last health check
UPDATE settings SET value = to_json(NOW()), updated_at = NOW() WHERE key = 'last_health_check';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ SovereigntyOS database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: workflows, jobs, cost_savings, manuscripts, events, users, settings, crisis_logs, parliamentary_analyses';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '🚀 Default workflows and settings inserted';
    RAISE NOTICE '🔍 Performance indexes created';
    RAISE NOTICE '📡 Real-time triggers and functions configured';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Next steps:';
    RAISE NOTICE '1. Get your Supabase service role key from Settings > API';
    RAISE NOTICE '2. Add database secrets to your GitHub repository';
    RAISE NOTICE '3. Deploy your SovereigntyOS application';
END$$;