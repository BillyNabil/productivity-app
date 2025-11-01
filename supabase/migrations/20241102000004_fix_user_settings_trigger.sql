-- Fix for user_settings trigger to handle errors gracefully
-- This migration adds error handling to the trigger and ensures
-- user_settings records are created even if the trigger fails

-- First, update the function with better error handling
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Wrap in BEGIN-EXCEPTION block for better error handling
  BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user_settings for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a function that can be called via API to ensure settings exist
CREATE OR REPLACE FUNCTION ensure_user_settings()
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  user_id_var UUID;
  existing_settings RECORD;
BEGIN
  -- Get current user ID from auth context
  user_id_var := auth.uid();
  
  IF user_id_var IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT;
    RETURN;
  END IF;
  
  -- Check if settings already exist
  SELECT * INTO existing_settings FROM user_settings WHERE user_id = user_id_var;
  
  IF existing_settings IS NOT NULL THEN
    RETURN QUERY SELECT true, 'User settings already exist'::TEXT;
    RETURN;
  END IF;
  
  -- Create settings
  INSERT INTO user_settings (user_id) VALUES (user_id_var)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY SELECT true, 'User settings created'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_settings() TO authenticated;

-- Update the RLS policy for user_settings to allow anon users to insert during signup
-- This is important for the signup flow
CREATE POLICY "Service role can create settings for any user"
  ON user_settings FOR INSERT
  WITH CHECK (true);
