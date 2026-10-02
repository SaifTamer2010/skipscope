-- SQL script to update the users table with new profile fields

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;

-- Example: Add a constraint to ensure specific roles (optional)
-- ALTER TABLE public.users ADD CONSTRAINT check_user_role 
-- CHECK (role IN ('CEO', 'Investor', 'Realtor'));

COMMENT ON COLUMN public.users.role IS 'The professional role of the user';
COMMENT ON COLUMN public.users.age IS 'The age of the user (optional)';
COMMENT ON COLUMN public.users.phone IS 'The contact phone number of the user';
COMMENT ON COLUMN public.users.company IS 'The name of the company the user represents';
