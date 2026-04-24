import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkTypeRow } from "@/lib/types/database";

const FALLBACK: WorkTypeRow[] = [
  { key: "website", label: "Website", created_at: "" },
  { key: "social_media", label: "Social Media", created_at: "" },
  { key: "branding", label: "Branding", created_at: "" },
  { key: "other", label: "Other", created_at: "" },
];

export const workTypeService = {
  async list(supabase: SupabaseClient): Promise<WorkTypeRow[]> {
    const { data, error } = await supabase.from("work_types").select("*").order("label", { ascending: true });
    if (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === "PGRST205") return FALLBACK;
      throw error;
    }
    return (data ?? []) as WorkTypeRow[];
  },
};

