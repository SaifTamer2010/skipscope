-- ========================================
-- ADMIN CONTROL PANEL SCHEMA
-- ========================================
-- Run this in Supabase SQL Editor AFTER the main schema

-- ========================================
-- 1. ADMIN USERS TABLE (OTP-ONLY AUTH)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  totp_secret TEXT, -- Encrypted TOTP secret
  is_enrolled BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. REQUEST STATUS COLUMNS (KANBAN)
-- ========================================
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  order_index INT NOT NULL,
  color VARCHAR(50) DEFAULT 'gray',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default columns
INSERT INTO kanban_columns (name, order_index, color) VALUES
  ('New', 0, 'blue'),
  ('In Progress', 1, 'purple'),
  ('Waiting', 2, 'yellow'),
  ('Completed', 3, 'green'),
  ('Archived', 4, 'gray')
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. ENHANCED REQUESTS TABLE
-- ========================================
-- Add new columns to existing requests table
ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS kanban_column_id UUID REFERENCES kanban_columns(id),
  ADD COLUMN IF NOT EXISTS kanban_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES admin_users(id),
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Set default column for existing requests
UPDATE requests 
SET kanban_column_id = (SELECT id FROM kanban_columns WHERE name = 'New' LIMIT 1)
WHERE kanban_column_id IS NULL;

-- ========================================
-- 4. DUAL FILE UPLOAD SYSTEM
-- ========================================
-- Admin-only internal files
CREATE TABLE IF NOT EXISTS admin_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size BIGINT,
  file_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES admin_users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Client-visible files (uploaded by admin)
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size BIGINT,
  file_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES admin_users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_visible_to_client BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- ========================================
-- 5. ACTIVITY LOG
-- ========================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id),
  action_type VARCHAR(100) NOT NULL, -- 'status_change', 'file_upload', 'note_added', 'assigned'
  action_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. ADMIN LOGIN AUDIT LOG
-- ========================================
CREATE TABLE IF NOT EXISTS admin_login_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  username VARCHAR(100),
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. ADMIN SESSIONS
-- ========================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_requests_kanban_column ON requests(kanban_column_id, kanban_order);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_admin ON requests(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_files_request ON admin_files(request_id);
CREATE INDEX IF NOT EXISTS idx_client_files_request ON client_files(request_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_request ON activity_log(request_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_admin ON activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ========================================
-- 9. TRIGGERS
-- ========================================
-- Auto-update updated_at for admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin users can read all admin data
CREATE POLICY admin_users_read ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can modify admin users
CREATE POLICY admin_users_manage ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Admin files - only accessible by admins
CREATE POLICY admin_files_access ON admin_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Client files - admins can manage, clients can read
CREATE POLICY client_files_admin_manage ON client_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY client_files_client_read ON client_files
  FOR SELECT
  TO authenticated
  USING (
    is_visible_to_client = true AND
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

-- ========================================
-- 11. STORAGE BUCKETS (Run in Supabase Dashboard)
-- ========================================
-- Create two separate storage buckets:
-- 1. 'admin-files' - Internal admin files (private)
-- 2. 'client-files' - Client-visible files (restricted)

-- To create buckets, run this in Supabase SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('admin-files', 'admin-files', false, 52428800, NULL),
  ('client-files', 'client-files', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin-files bucket
CREATE POLICY "Admin users can upload admin files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-files' AND
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admin users can read admin files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-files' AND
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- Storage policies for client-files bucket
CREATE POLICY "Admin users can upload client files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-files' AND
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Clients can read their files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-files' AND
  (
    -- Admins can see all
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) OR
    -- Clients can see their own
    EXISTS (
      SELECT 1 FROM client_files cf
      JOIN requests r ON cf.request_id = r.id
      WHERE cf.file_path = name AND r.user_id = auth.uid() AND cf.is_visible_to_client = true
    )
  )
);

-- ========================================
-- 12. SEED DATA (Create first super admin)
-- ========================================
-- This creates a super admin account
-- Username: 'superadmin'
-- They will need to complete OTP enrollment on first login

INSERT INTO admin_users (username, display_name, is_super_admin, is_enrolled)
VALUES ('superadmin', 'Super Administrator', true, false)
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- 13. HELPER FUNCTIONS
-- ========================================

-- Function to get request statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'active_users', (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'),
    'total_requests', (SELECT COUNT(*) FROM requests),
    'requests_by_status', (
      SELECT json_object_agg(kc.name, count)
      FROM (
        SELECT kanban_column_id, COUNT(*) as count
        FROM requests
        GROUP BY kanban_column_id
      ) r
      JOIN kanban_columns kc ON r.kanban_column_id = kc.id
    ),
    'requests_today', (SELECT COUNT(*) FROM requests WHERE created_at::date = CURRENT_DATE),
    'completed_this_week', (
      SELECT COUNT(*) FROM requests r
      JOIN kanban_columns kc ON r.kanban_column_id = kc.id
      WHERE kc.name = 'Completed' AND r.updated_at > NOW() - INTERVAL '7 days'
    ),
    'avg_completion_time', (
      SELECT EXTRACT(EPOCH FROM AVG(updated_at - created_at)) / 3600 -- hours
      FROM requests r
      JOIN kanban_columns kc ON r.kanban_column_id = kc.id
      WHERE kc.name = 'Completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_request_id UUID,
  p_admin_id UUID,
  p_action_type VARCHAR,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_log (request_id, admin_id, action_type, action_description, metadata)
  VALUES (p_request_id, p_admin_id, p_action_type, p_description, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SCHEMA COMPLETE
-- ========================================
