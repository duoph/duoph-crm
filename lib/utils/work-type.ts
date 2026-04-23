import type { WorkType } from "@/lib/types/database";

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  website: "Website",
  social_media: "Social Media",
  branding: "Branding",
  other: "Other",
};

export function workTypeBadgeClass(w: WorkType): string {
  const map: Record<WorkType, string> = {
    website: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    social_media: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    branding: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return map[w];
}
