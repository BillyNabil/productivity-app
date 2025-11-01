import { createClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Ensures user settings exist for the current authenticated user
 * Used as a fallback if the database trigger fails
 */
export async function ensureUserSettings(supabaseClient?: any) {
  try {
    const client = supabaseClient || createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      console.warn("ensureUserSettings: No authenticated user");
      return false;
    }

    // Try to fetch existing settings
    const { data: existingSettings, error: fetchError } = await client
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If settings exist, we're done
    if (existingSettings) {
      return true;
    }

    // If error is not "no rows returned", log it
    if (fetchError && fetchError.code !== "PGRST116") {
      console.warn("Error fetching user settings:", fetchError);
    }

    // Settings don't exist, create them
    const { data: newSettings, error: createError } = await client
      .from("user_settings")
      .insert([
        {
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (createError) {
      // If it's a duplicate key error, that's fine - another process created it
      if (createError.code === "23505") {
        console.info("User settings already exist (created by another process)");
        return true;
      }
      console.error("Failed to create user settings:", createError);
      return false;
    }

    console.info("User settings created successfully", newSettings);
    return true;
  } catch (error) {
    console.error("Unexpected error in ensureUserSettings:", error);
    return false;
  }
}

/**
 * Server-side version for use in API routes or server actions
 */
export async function ensureUserSettingsServer() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.warn("ensureUserSettingsServer: No authenticated user");
      return false;
    }

    // Check if settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingSettings) {
      return true;
    }

    if (fetchError && fetchError.code !== "PGRST116") {
      console.warn("Error fetching user settings:", fetchError);
    }

    // Create settings if they don't exist
    const { data: newSettings, error: createError } = await supabase
      .from("user_settings")
      .insert([
        {
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (createError) {
      if (createError.code === "23505") {
        console.info("User settings already exist");
        return true;
      }
      console.error("Failed to create user settings:", createError);
      return false;
    }

    console.info("User settings created successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error in ensureUserSettingsServer:", error);
    return false;
  }
}
