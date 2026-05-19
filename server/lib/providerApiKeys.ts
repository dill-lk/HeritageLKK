import { createClient } from "@supabase/supabase-js";
import { getRequiredServerSupabaseConfig } from "./supabase";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

const getSupabaseAdmin = () => {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }
  const { supabaseUrl } = getRequiredServerSupabaseConfig();
  if (!supabaseServiceRoleKey) {
    throw new Error("Server key store is not configured (SUPABASE_SERVICE_ROLE_KEY required)");
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdmin;
};

export const getProviderApiKey = async (provider: string) => {
  const normalizedProvider = provider.trim().toLowerCase();
  const providerEnvKeyName = `${normalizedProvider.replace(/[^a-z0-9]/g, "_").toUpperCase()}_API_KEY`;
  const envApiKey = process.env[providerEnvKeyName]?.trim();

  // Prefer direct server env key when present (simple and robust for local/dev).
  if (envApiKey) {
    return envApiKey;
  }

  let adminClient: ReturnType<typeof createClient>;
  try {
    adminClient = getSupabaseAdmin();
  } catch {
    throw new Error(
      `Missing API key for provider: ${normalizedProvider}. Set ${providerEnvKeyName} or configure SUPABASE_SERVICE_ROLE_KEY with private.api_keys.`,
    );
  }

  const { data, error } = await adminClient
    .from("private.api_keys")
    .select("api_key")
    .eq("provider", normalizedProvider)
    .maybeSingle();

  const apiKey = (data as unknown as { api_key?: string } | null)?.api_key;

  if (error || !apiKey) {
    throw new Error(
      `Missing API key for provider: ${normalizedProvider}. Set ${providerEnvKeyName} or add '${normalizedProvider}' to private.api_keys.`,
    );
  }

  return apiKey;
};
