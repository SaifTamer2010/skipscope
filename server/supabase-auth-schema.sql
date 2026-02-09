-- Enable Supabase Auth integration

-- 1. Modify users table to reference auth.users
-- Note: existing users table might need migration if you have data. 
-- Since we are starting fresh/switching, we assume we can alter or recreate.

-- Ensure the users table relies on auth.users
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS password_hash, -- Supabase handles passwords
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create a trigger to automatically create a public user when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, settings)
  VALUES (new.id, new.email, '{"theme": "dark", "notifications": true}');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger implementation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS (Row Level Security) - Optional but recommended if you query valid Supabase directly from frontend
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);
