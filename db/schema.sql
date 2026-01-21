-- ZAX Database Schema (Phase 1)
-- Optimized for PostgreSQL + pgvector + TimescaleDB

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (Core Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    university_id VARCHAR(50) UNIQUE, -- For student verification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Essence Vectors (SCD Type 2: Slowly Changing Dimensions)
-- Stores the high-dimensional representation of a user's essence over time.
CREATE TABLE user_embeddings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- OpenAI text-embedding-3-small generates 1536 dim vectors
    embedding VECTOR(1536), 
    
    -- Distinguish between long-term personality and short-term mood
    embedding_type VARCHAR(20) CHECK (embedding_type IN ('personality', 'interest', 'mood', 'feedback')),

    -- Delta Vector (MVP Step 1): explicitly track the "Movement"
    -- This stores the difference from the previous state: V_current - V_prev
    -- Crucial for analyzing "Growth Direction"
    delta_vector VECTOR(1536), 
    
    -- SCD Type 2 Columns for History Tracking
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ, -- If NULL, this is the current active record
    
    -- Metadata for analysis
    context_tags JSONB, -- e.g. ["exam_period", "breakup"]
    interaction_score FLOAT DEFAULT 0.5, -- Learning weight (RLHF)
    
    -- Validation (Ensure logic consistency)
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for Fast Similarity Search (HNSW)
-- Optimized for finding 'current' similar users efficiently
CREATE INDEX idx_current_embeddings_hnsw ON user_embeddings 
USING hnsw (embedding vector_cosine_ops)
WHERE valid_to IS NULL; -- Partial index for active records

-- Time-series conversion (TimescaleDB)
-- Allows querying "How did this user's vector change over the last 3 months?"
SELECT create_hypertable('user_embeddings', 'valid_from', chunk_time_interval => interval '30 days');

-- 4. Interaction Logs (For RLHF)
-- Captures the "quality" of interactions to train the matching engine
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id UUID NOT NULL REFERENCES users(id),
    user_b_id UUID NOT NULL REFERENCES users(id),
    
    interaction_type VARCHAR(50) NOT NULL, -- 'chat_start', 'reply', 'meetup_verified'
    
    -- Quantitative Signals
    resonance_score_delta FLOAT, -- Change in visual resonance meter
    turn_taking_density FLOAT, -- From voice analysis (mock/future)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Evolution Feedback (Surveys)
CREATE TABLE feedback_loops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES interactions(id),
    user_id UUID REFERENCES users(id),
    
    self_reflection_text TEXT,
    receptivity_score_change FLOAT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
