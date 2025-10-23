-- API Settings Table Migration
-- Creates table for storing encrypted API keys and settings

-- Create api_settings table
CREATE TABLE IF NOT EXISTS api_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username_encrypted TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('test', 'production')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_test_date TIMESTAMPTZ,
    last_test_status TEXT CHECK (last_test_status IN ('success', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for active settings lookup
CREATE INDEX IF NOT EXISTS idx_api_settings_active ON api_settings(is_active, created_at DESC);

-- Create index for environment lookup
CREATE INDEX IF NOT EXISTS idx_api_settings_environment ON api_settings(environment);

-- Enable RLS
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_settings
-- Only authenticated users can access API settings
CREATE POLICY "Users can view api_settings" ON api_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert api_settings" ON api_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update api_settings" ON api_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete api_settings" ON api_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_api_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_api_settings_updated_at
    BEFORE UPDATE ON api_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_api_settings_updated_at();

-- Add comments
COMMENT ON TABLE api_settings IS 'Stores encrypted credentials and configuration for external services';
COMMENT ON COLUMN api_settings.username_encrypted IS 'Encrypted username for external service authentication';
COMMENT ON COLUMN api_settings.password_encrypted IS 'Encrypted password for external service authentication';
COMMENT ON COLUMN api_settings.environment IS 'Environment setting: test or production';
COMMENT ON COLUMN api_settings.is_active IS 'Whether this API configuration is currently active';
COMMENT ON COLUMN api_settings.last_test_date IS 'Last time the API connection was tested';
COMMENT ON COLUMN api_settings.last_test_status IS 'Result of the last API connection test';