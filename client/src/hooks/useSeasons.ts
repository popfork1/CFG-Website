import { useQuery } from "@tanstack/react-query";
import type { Season, WeekConfig } from "@shared/schema";

export type SeasonWithWeeks = Season & { weekConfigs: WeekConfig[] };

export function useActiveSeason() {
  return useQuery<SeasonWithWeeks>({
    queryKey: ["/api/seasons/active"],
    staleTime: 60_000,
  });
}

export function useAllSeasons() {
  return useQuery<Season[]>({
    queryKey: ["/api/seasons"],
    staleTime: 60_000,
  });
}

export function useSeasonWeeks(seasonId: string | undefined) {
  return useQuery<WeekConfig[]>({
    queryKey: ["/api/seasons", seasonId, "weeks"],
    queryFn: async () => {
      if (!seasonId) return [];
      const res = await fetch(`/api/seasons/${seasonId}/weeks`);
      if (!res.ok) throw new Error("Failed to fetch week configs");
      return res.json();
    },
    enabled: !!seasonId,
    staleTime: 60_000,
  });
}

export function getWeekLabel(weekNumber: number, weekConfigs: WeekConfig[]): string {
  const cfg = weekConfigs.find(c => c.weekNumber === weekNumber);
  if (cfg) return cfg.label;
  return `Week ${weekNumber}`;
}
