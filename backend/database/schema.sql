-- APEX PostgreSQL DDL Schema Definition
-- Production-ready schema targeting PostgreSQL 16+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Enable pgvector extension for RAG search

-- -----------------------------------------------------
-- TABLE 1: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 2: user_preferences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dnd_during_flow BOOLEAN NOT NULL DEFAULT true,
    socratic_challenge_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (socratic_challenge_level IN ('low', 'medium', 'high')),
    environment_sculpt_enabled BOOLEAN NOT NULL DEFAULT true,
    screen_greyscale_trigger VARCHAR(20) NOT NULL DEFAULT 'Fatigued',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 3: auth_tokens
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) UNIQUE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL
);

-- -----------------------------------------------------
-- TABLE 4: device_registrations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS device_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('mobile', 'desktop')),
    push_token VARCHAR(512),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 5: calibration_profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS calibration_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baseline_hr DOUBLE PRECISION NOT NULL,
    baseline_hrv DOUBLE PRECISION NOT NULL,
    eye_tracking_sensitivity DOUBLE PRECISION NOT NULL,
    calibrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 6: raw_signals (Partitioned monthly by timestamp)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_signals (
    id BIGSERIAL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    heart_rate DOUBLE PRECISION,
    hrv DOUBLE PRECISION,
    blink_rate INTEGER,
    screen_interaction DOUBLE PRECISION,
    active_app VARCHAR(100),
    ambient_db DOUBLE PRECISION,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Default fallback partition to enable immediate writes
CREATE TABLE IF NOT EXISTS raw_signals_default PARTITION OF raw_signals DEFAULT;

-- -----------------------------------------------------
-- TABLE 7: cognitive_states
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cognitive_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(20) NOT NULL CHECK (state IN ('Flow', 'Distracted', 'Fatigued', 'Overloaded')),
    confidence DOUBLE PRECISION NOT NULL,
    determined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------
-- TABLE 8: cognitive_state_overrides
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cognitive_state_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state_id UUID NOT NULL REFERENCES cognitive_states(id) ON DELETE CASCADE,
    user_provided_state VARCHAR(20) NOT NULL CHECK (user_provided_state IN ('Flow', 'Distracted', 'Fatigued', 'Overloaded')),
    justification TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 9: cognitive_state_patterns
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cognitive_state_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    statistics_json JSONB NOT NULL
);

-- -----------------------------------------------------
-- TABLE 10: deadlines
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 11: subtasks
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deadline_id UUID NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 12: deadline_risk_scores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS deadline_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deadline_id UUID NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
    risk_coefficient DOUBLE PRECISION NOT NULL CHECK (risk_coefficient >= 0.0 AND risk_coefficient <= 1.0),
    risk_tier VARCHAR(20) NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
    reasoning JSONB NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 13: academic_syllabi
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_syllabi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    raw_text TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 14: agents
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) UNIQUE NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- -----------------------------------------------------
-- TABLE 15: agent_configurations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_configurations (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    config_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, agent_id)
);

-- -----------------------------------------------------
-- TABLE 16: agent_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    action_taken VARCHAR(100) NOT NULL,
    execution_details JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 17: agent_approvals
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    payload JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 18: work_sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    efficiency_score DOUBLE PRECISION
);

-- -----------------------------------------------------
-- TABLE 19: focus_sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_session_id UUID NOT NULL REFERENCES work_sessions(id) ON DELETE CASCADE,
    goal_statement TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ
);

-- -----------------------------------------------------
-- TABLE 20: focus_distractions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS focus_distractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    focus_session_id UUID NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
    app_name VARCHAR(100) NOT NULL,
    window_title VARCHAR(255),
    duration_seconds INTEGER NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 21: voice_recordings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_url VARCHAR(512) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    duration_seconds DOUBLE PRECISION NOT NULL
);

-- -----------------------------------------------------
-- TABLE 22: voice_transcripts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES voice_recordings(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    summary TEXT,
    insights_json JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 23: knowledge_nodes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- 1536 is default dimension size for standard OpenAI / generic embeddings
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 24: knowledge_links
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- TABLE 25: peer_platforms
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS peer_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL CHECK (platform_name IN ('Discord', 'Slack', 'Teams')),
    auth_token_enc BYTEA NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 26: peer_summaries
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS peer_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL REFERENCES peer_platforms(id) ON DELETE CASCADE,
    original_context TEXT,
    summary TEXT NOT NULL,
    urgency_score DOUBLE PRECISION NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 27: peer_groups
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS peer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 28: peer_group_members
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS peer_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES peer_groups(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    external_handle VARCHAR(255)
);

-- -----------------------------------------------------
-- TABLE 29: workspace_environments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sculpt_state VARCHAR(50) NOT NULL,
    modified_devices JSONB NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 30: socratic_challenges
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS socratic_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_challenge TEXT NOT NULL,
    conceptual_anchor VARCHAR(255) NOT NULL,
    presented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 31: socratic_responses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS socratic_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES socratic_challenges(id) ON DELETE CASCADE,
    student_response TEXT NOT NULL,
    evaluation_score DOUBLE PRECISION NOT NULL,
    feedback_given TEXT,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- TABLE 32: sync_queue
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_queue (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_raw_signals_user_time ON raw_signals (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_subtasks_deadline ON subtasks (deadline_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_due ON deadlines (user_id, due_date ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_cognitive_states_user_time ON cognitive_states (user_id, determined_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_time ON agent_logs (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_ws ON focus_sessions (work_session_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_queued ON sync_queue (user_id, queued_at ASC);
