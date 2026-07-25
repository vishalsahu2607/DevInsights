import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} environment variable is missing. Add it in Vercel and your local .env file.`,
    );
  }

  return value;
}

const supabaseUrl =
  getRequiredEnvironmentVariable("SUPABASE_URL");

const supabaseSecretKey =
  getRequiredEnvironmentVariable(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

if (!supabaseUrl.startsWith("https://")) {
  throw new Error(
    "SUPABASE_URL is invalid. It should look like https://your-project.supabase.co",
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": "devinsights-server",
      },
    },
  },
);