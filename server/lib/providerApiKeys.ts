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
  const adminClient = getSupabaseAdmin();

  const normalizedProvider = provider.trim().toLowerCase();
  const { data, error } = await adminClient
    .from("private.api_keys")
    .select("api_key")
    .eq("provider", normalizedProvider)
    .maybeSingle();

  const apiKey = (data as unknown as { api_key?: string } | null)?.api_key;

  if (error || !apiKey) {
    throw new Error(`Missing API key for provider: ${normalizedProvider}`);
  }

  return apiKey;
};
