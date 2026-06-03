import { useQuery } from "@tanstack/react-query";
import type { Team } from "@shared/schema";

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["/api/teams"],
    staleTime: 1000 * 60 * 5,
  });
}

export function getTeamLogo(teams: Team[] | undefined, teamName: string): string | undefined {
  if (!teams) return undefined;
  return teams.find(t => t.name.toLowerCase() === teamName.toLowerCase())?.logo || undefined;
}
