import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameCard } from "@/components/GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Game, Season } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { AlertCircle, Archive, Calendar, Trophy, ChevronRight } from "lucide-react";
import { useAllSeasons, useSeasonWeeks, getWeekLabel } from "@/hooks/useSeasons";

function SeasonArchiveView({ season }: { season: Season }) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const { data: weekCfgs = [] } = useSeasonWeeks(season.id);
  const [, setLocation] = useLocation();

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/week", selectedWeek, season.number],
    queryFn: async () => {
      const res = await fetch(`/api/games/week/${selectedWeek}?season=${season.number}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });

  const { data: allGames } = useQuery<Game[]>({
    queryKey: ["/api/games/all", season.number],
    queryFn: async () => {
      const res = await fetch(`/api/games/all?season=${season.number}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });

  const weeks = Array.from({ length: season.totalWeeks }, (_, i) => i + 1);

  const gamesByWeek = allGames?.reduce((acc, game) => {
    if (!acc[game.week]) acc[game.week] = [];
    acc[game.week].push(game);
    return acc;
  }, {} as Record<number, Game[]>) || {};

  const playoffWeeks = weeks.filter(w => {
    const cfg = weekCfgs.find(c => c.weekNumber === w);
    return cfg?.isPlayoff && gamesByWeek[w]?.length > 0;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {weeks.map((week) => {
            const label = getWeekLabel(week, weekCfgs);
            const active = selectedWeek === week;
            const hasGames = !!gamesByWeek[week];
            return (
              <Button
                key={week}
                variant="ghost"
                onClick={() => setSelectedWeek(week)}
                className={`h-10 px-5 rounded-2xl font-black uppercase tracking-widest text-[9px] border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : hasGames
                    ? "bg-card/40 backdrop-blur-xl border-border/40 hover:bg-card/60"
                    : "bg-transparent border-border/20 text-muted-foreground/30"
                }`}
                data-testid={`button-week-${week}`}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[40px] bg-card/40" />
          ))}
        </div>
      ) : games && games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setLocation(`/game/${game.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center border-dashed border-2 border-border/40 bg-transparent rounded-[40px]">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
            No games logged for {getWeekLabel(selectedWeek, weekCfgs)}
          </p>
        </Card>
      )}

      {playoffWeeks.length > 0 && (
        <div className="space-y-10 pt-10 border-t border-border/20">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
            <Trophy className="w-7 h-7 text-primary" />
            {season.name} Playoffs
          </h3>
          <div className="space-y-12">
            {playoffWeeks.map((week) => (
              <div key={week} className="space-y-6">
                <h4 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-primary rounded-full" />
                  {getWeekLabel(week, weekCfgs)}
                </h4>
                <div className="flex flex-wrap gap-5">
                  {gamesByWeek[week]?.map((game) => (
                    <Link href={`/game/${game.id}`} key={game.id}>
                      <Card className="group p-4 bg-card/40 backdrop-blur-xl border-border/40 hover:bg-card/60 transition-all duration-300 rounded-3xl cursor-pointer min-w-44" data-testid={`card-game-${game.id}`}>
                        <div className="flex flex-col gap-3">
                          <Badge
                            variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
                            className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full w-fit ${game.isLive ? 'animate-pulse' : 'bg-muted/50 border-none'}`}
                          >
                            {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : "Scheduled"}
                          </Badge>
                          <div className="text-sm font-black italic uppercase tracking-tight">
                            <div className="truncate group-hover:text-primary transition-colors">{game.team1}</div>
                            <div className="text-[10px] text-muted-foreground/30 my-1 not-italic">VS</div>
                            <div className="truncate group-hover:text-primary transition-colors">{game.team2}</div>
                          </div>
                          {game.isFinal && (
                            <div className="text-xl font-black italic tabular-nums tracking-tighter border-t border-border/20 pt-2">
                              {game.team1Score} – {game.team2Score}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreviousWeeks() {
  const { data: seasons = [], isLoading } = useAllSeasons();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const archivedSeasons = seasons.filter(s => s.status === "archived");
  const selectedSeason = selectedSeasonId
    ? seasons.find(s => s.id === selectedSeasonId)
    : archivedSeasons[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          <Skeleton className="h-24 w-80 rounded-[24px] bg-card/40" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-28 rounded-2xl bg-card/40" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-[40px] bg-card/40" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            <Archive className="w-3.5 h-3.5 mr-2" />
            League History
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Archives
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            Browse completed seasons — every week, every matchup, every result.
          </p>
        </div>

        {archivedSeasons.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 border-border/40 bg-transparent rounded-[40px]">
            <Archive className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
              No archived seasons yet
            </p>
            <p className="text-muted-foreground/50 text-xs mt-2">Seasons show up here once they've been archived in the admin panel.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Season</h2>
              <div className="flex flex-wrap gap-2">
                {archivedSeasons.map(s => (
                  <Button
                    key={s.id}
                    variant="ghost"
                    onClick={() => setSelectedSeasonId(s.id)}
                    className={`h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
                      selectedSeason?.id === s.id
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-card/40 backdrop-blur-xl border-border/40 hover:bg-card/60"
                    }`}
                    data-testid={`button-season-${s.number}`}
                  >
                    S{s.number} — {s.name}
                  </Button>
                ))}
              </div>
            </div>

            {selectedSeason && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                      {selectedSeason.name}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                      {selectedSeason.totalWeeks} weeks{selectedSeason.year ? ` · ${selectedSeason.year}` : ""}
                    </p>
                  </div>
                </div>
                <SeasonArchiveView season={selectedSeason} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
