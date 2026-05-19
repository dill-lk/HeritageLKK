import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export const getProviderApiKey = async (provider: string) => {
  if (!supabaseAdmin) {
    throw new Error("Server key store is not configured (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required)");
  }

  const normalizedProvider = provider.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .schema("private")
    .from("api_keys")
    .select("api_key")
    .eq("provider", normalizedProvider)
    .single();

  if (error || !data?.api_key) {
    throw new Error(`Missing API key for provider: ${normalizedProvider}`);
  }

  return data.api_key;
};
