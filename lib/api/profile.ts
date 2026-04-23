import type { SupabaseClient } from "@supabase/supabase-js";
import type { UsersProfile } from "@/lib/types/database";

export const profileService = {
  async get(supabase: SupabaseClient, userId: string): Promise<UsersProfile | null> {
    const { data, error } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as UsersProfile) ?? null;
  },

  async update(supabase: SupabaseClient, userId: string, admin_name: string): Promise<UsersProfile> {
    const { data, error } = await supabase
      .from("users_profile")
      .update({ admin_name })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as UsersProfile;
  },
};
