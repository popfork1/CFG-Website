import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Game, News as NewsType, Pickem, PickemRules, Changelog, InsertChangelog, StreamRequest, User, Team, Player, Partner } from "@shared/schema";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Plus, Trash2, Edit, Save, Wrench, Users, LayoutDashboard, ShieldCheck, Zap, Newspaper, Trophy, Calendar, UserPlus, Settings, Heart, FileUp, Layers, ChevronDown, ChevronRight, Check, Archive, PlayCircle } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useAllSeasons, useSeasonWeeks, useActiveSeason, getWeekLabel } from "@/hooks/useSeasons";
import type { Season, WeekConfig } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["admin", "streamer"].includes((user as any)?.role))) {
      toast({
        title: "Unauthorized",
        description: "Staff access only. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, (user as any)?.role, isLoading, toast]);

  if (!isAuthenticated || !["admin", "streamer"].includes((user as any)?.role)) {
    return null;
  }

  const role = (user as any)?.role;

  const ADMIN_TABS = [
    ...(role === "admin" ? [
      { value: "seasons", label: "Seasons", icon: Layers },
      { value: "games", label: "Schedule", icon: Calendar },
      { value: "scores", label: "Scores", icon: Trophy },
      { value: "teams", label: "Teams", icon: Users },
      { value: "news", label: "News", icon: Newspaper },
      { value: "bracket", label: "Bracket", icon: LayoutDashboard },
      { value: "changelogs", label: "Logs", icon: Zap },
    ] : []),
    { value: "streams", label: "Streams", icon: ShieldCheck },
    ...(role === "admin" ? [
      { value: "users", label: "Users", icon: UserPlus },
      { value: "partners", label: "Partners", icon: Heart },
      { value: "settings", label: "Config", icon: Settings },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="relative group p-6 sm:p-8 md:p-12 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              League Operations
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
              Admin <span className="text-primary">Console</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
              Manage matchups, content, and system configuration with elite control.
            </p>
          </div>
          <div className="absolute -bottom-16 -right-16 text-[200px] opacity-[0.02] select-none font-black italic pointer-events-none">ADMIN</div>
        </div>

        <Tabs defaultValue="games" className="space-y-10">
          <div className="p-2 bg-card/30 backdrop-blur-xl border border-border/40 rounded-[32px] inline-flex">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
              {ADMIN_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-white/5"
                  data-testid={`tab-${tab.value}`}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Card className="p-8 md:p-12 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            {role === "admin" && (
              <>
                <TabsContent value="seasons" className="mt-0 outline-none"><SeasonsManager /></TabsContent>
                <TabsContent value="games" className="mt-0 outline-none">
                  <GamesManager />
                </TabsContent>
                <TabsContent value="scores" className="mt-0 outline-none"><ScoresManager /></TabsContent>
                <TabsContent value="teams" className="mt-0 outline-none"><TeamsManager /></TabsContent>
                <TabsContent value="news" className="mt-0 outline-none"><NewsManager /></TabsContent>
                <TabsContent value="bracket" className="mt-0 outline-none"><BracketManager /></TabsContent>
                <TabsContent value="changelogs" className="mt-0 outline-none"><ChangelogManager /></TabsContent>
              </>
            )}
            <TabsContent value="streams" className="mt-0 outline-none"><StreamRequestsManager /></TabsContent>
            {role === "admin" && (
              <>
                <TabsContent value="users" className="mt-0 outline-none"><UsersManager /></TabsContent>
                <TabsContent value="partners" className="mt-0 outline-none"><PartnersManager /></TabsContent>
                <TabsContent value="settings" className="mt-0 outline-none"><SettingsManager /></TabsContent>
              </>
            )}
          </Card>
        </Tabs>
      </div>
    </div>
  );
}

function GamesManager() {
  const { toast } = useToast();
  const [week, setWeek] = useState(1);
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [gamesList, setGamesList] = useState<Array<{ team1: string; team2: string; date: string; time: string; isPrimetime: boolean }>>([
    { team1: "", team2: "", date: "", time: "", isPrimetime: false },
  ]);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const { data: activeSeason } = useActiveSeason();
  const totalWeeks = activeSeason?.totalWeeks ?? 15;
  const weekCfgs = activeSeason?.weekConfigs ?? [];

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });
  const { data: teamsData = [] } = useTeams();
  const AVAILABLE_TEAMS = teamsData.map(t => t.name).sort();

  const createMutation = useMutation({
    mutationFn: async (games: Array<{ week: number; team1: string; team2: string; date: string; time: string; isPrimetime: boolean }>) => {
      await Promise.all(games.map((game) => {
        const payload: any = {
          week: game.week,
          team1: game.team1,
          team2: game.team2,
          gameTime: null,
          isPrimetime: game.isPrimetime,
        };
        if (game.date && game.time) {
          const gameTime = new Date(`${game.date}T${game.time}`);
          payload.gameTime = gameTime.toISOString();
        }
        return apiRequest("POST", "/api/games", payload);
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Week scheduled successfully" });
      setGamesList([{ team1: "", team2: "", date: "", time: "", isPrimetime: false }]);
      setWeek(1);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to schedule week", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/games/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Game deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      if (date && time) {
        const gameTime = new Date(`${date}T${time}`);
        await apiRequest("PATCH", `/api/games/${id}`, { gameTime: gameTime.toISOString() });
      } else {
        await apiRequest("PATCH", `/api/games/${id}`, { gameTime: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Game time updated successfully" });
      setEditingGameId(null);
      setEditDate("");
      setEditTime("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update game time", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGames = gamesList.filter((g) => g.team1.trim() && g.team2.trim()).map((g) => {
      if (!g.date || !g.time) {
        return { ...g, date: "", time: "" };
      }
      return g;
    });
    if (validGames.length === 0) {
      toast({ title: "Error", description: "Add at least one game with teams", variant: "destructive" });
      return;
    }
    createMutation.mutate(validGames.map((g) => ({ week, ...g })));
  };

  const handleGameChange = (index: number, field: "team1" | "team2" | "date" | "time", value: string) => {
    const updated = [...gamesList];
    updated[index] = { ...updated[index], [field]: value };
    setGamesList(updated);
  };

  const handlePrimetimeChange = (index: number, value: boolean) => {
    const updated = [...gamesList];
    updated[index] = { ...updated[index], isPrimetime: value };
    setGamesList(updated);
  };

  const addGameRow = () => {
    setGamesList([...gamesList, { team1: "", team2: "", date: "", time: "", isPrimetime: false }]);
  };

  const removeGameRow = (index: number) => {
    setGamesList(gamesList.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule Week</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="week">Week</Label>
            <Select 
              value={String(week)} 
              onValueChange={(v) => setWeek(parseInt(v))}
            >
              <SelectTrigger id="week" data-testid="select-week">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(totalWeeks)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {getWeekLabel(i + 1, weekCfgs)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Games</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGameRow}
                className="gap-2"
                data-testid="button-add-game-row"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </Button>
            </div>

            {gamesList.map((game, index) => {
              const usedTeams = gamesList.map(g => g.team1).concat(gamesList.map(g => g.team2)).filter(t => t && (t !== game.team1 || t === game.team1) && (t !== game.team2 || t === game.team2));
              const availableTeams = AVAILABLE_TEAMS.filter(t => !usedTeams.includes(t) || t === game.team1 || t === game.team2);
              return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-md bg-muted/30" data-testid={`game-row-${index}`}>
                <div>
                  <Label htmlFor={`team2-${index}`}>Team 2</Label>
                  <Select value={game.team2} onValueChange={(value) => handleGameChange(index, "team2", value)}>
                    <SelectTrigger id={`team2-${index}`} data-testid={`select-team2-${index}`}>
                      <SelectValue placeholder="Select Team 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`team1-${index}`}>Team 1</Label>
                  <Select value={game.team1} onValueChange={(value) => handleGameChange(index, "team1", value)}>
                    <SelectTrigger id={`team1-${index}`} data-testid={`select-team1-${index}`}>
                      <SelectValue placeholder="Select Team 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`date-${index}`}>Date</Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={game.date}
                    onChange={(e) => handleGameChange(index, "date", e.target.value)}
                    data-testid={`input-date-${index}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`time-${index}`}>Time</Label>
                  <Input
                    id={`time-${index}`}
                    type="time"
                    value={game.time}
                    onChange={(e) => handleGameChange(index, "time", e.target.value)}
                    data-testid={`input-time-${index}`}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={game.isPrimetime}
                      onCheckedChange={(checked) => handlePrimetimeChange(index, checked)}
                      data-testid={`switch-primetime-${index}`}
                    />
                    <Label htmlFor={`primetime-${index}`}>Primetime</Label>
                  </div>
                </div>
                {gamesList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGameRow(index)}
                    className="md:col-span-5 justify-self-end"
                    data-testid={`button-remove-game-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              );
            })}
          </div>

          <Button type="submit" className="gap-2 w-full" disabled={createMutation.isPending} data-testid="button-schedule-week">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Scheduling..." : `Schedule Week ${week}`}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Games</h2>
          <div className="w-40">
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger data-testid="select-filter-week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {[...Array(totalWeeks)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {getWeekLabel(i + 1, weekCfgs)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          {games?.filter(game => filterWeek === "all" || game.week === parseInt(filterWeek)).map((game) => (
            <div key={game.id} data-testid={`game-item-${game.id}`}>
              {editingGameId === game.id ? (
                <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                  <p className="font-semibold">{game.team2} vs {game.team1}</p>
                  <p className="text-sm text-muted-foreground">
                    {editDate && editTime ? `${editDate} at ${editTime}` : "Time TBD"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`edit-date-${game.id}`}>Date</Label>
                      <Input
                        id={`edit-date-${game.id}`}
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        data-testid={`input-edit-date-${game.id}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-time-${game.id}`}>Time</Label>
                      <Input
                        id={`edit-time-${game.id}`}
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        data-testid={`input-edit-time-${game.id}`}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button
                        size="sm"
                        onClick={() => updateTimeMutation.mutate({ id: game.id, date: editDate, time: editTime })}
                        disabled={updateTimeMutation.isPending || !editDate || !editTime}
                        data-testid={`button-save-time-${game.id}`}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateTimeMutation.mutate({ id: game.id, date: "", time: "" })}
                        disabled={updateTimeMutation.isPending}
                        data-testid={`button-clear-time-${game.id}`}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingGameId(null);
                          setEditDate("");
                          setEditTime("");
                        }}
                        data-testid={`button-cancel-edit-${game.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>Week {game.week}</Badge>
                      {game.isLive && <Badge variant="default">LIVE</Badge>}
                      {game.isFinal && <Badge variant="secondary">FINAL</Badge>}
                    </div>
                    <p className="font-semibold">{game.team2} vs {game.team1}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/Chicago", "MMM d, yyyy 'at' h:mm a 'CST'") : "Time TBD"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingGameId(game.id);
                        setEditDate("");
                        setEditTime("");
                      }}
                      data-testid={`button-edit-time-${game.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(game.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${game.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScoresManager() {
  const { toast } = useToast();
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Game> }) => {
      await apiRequest("PATCH", `/api/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        return typeof key[0] === 'string' && key[0]?.startsWith('/api/games');
      }});
      toast({ title: "Success", description: "Score updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Update Scores</h2>
          <div className="w-40">
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger data-testid="select-scores-filter-week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {[...Array(14)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {games?.filter(game => filterWeek === "all" || game.week === parseInt(filterWeek)).map((game) => (
            <Card key={game.id} className="p-4" data-testid={`score-card-${game.id}`}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <p className="font-semibold text-lg">{game.team2} vs {game.team1}</p>
                    <Badge variant={game.isFinal ? "secondary" : game.isLive ? "default" : "outline"}>
                      {game.isFinal ? "FINAL" : game.isLive ? "LIVE" : "SCHEDULED"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-center flex-1 sm:flex-none">
                      <Label className="text-[10px] uppercase text-muted-foreground block mb-1 truncate max-w-[80px] mx-auto">{game.team2}</Label>
                      <Input
                        type="number"
                        className="w-full sm:w-16 text-center h-10 px-2"
                        value={game.team2Score ?? 0}
                        onChange={(e) => updateMutation.mutate({ id: game.id, data: { team2Score: parseInt(e.target.value) } })}
                        data-testid={`team2Score-${game.id}`}
                      />
                    </div>
                    <span className="font-bold self-end pb-2">-</span>
                    <div className="text-center flex-1 sm:flex-none">
                      <Label className="text-[10px] uppercase text-muted-foreground block mb-1 truncate max-w-[80px] mx-auto">{game.team1}</Label>
                      <Input
                        type="number"
                        className="w-full sm:w-16 text-center h-10 px-2"
                        value={game.team1Score ?? 0}
                        onChange={(e) => updateMutation.mutate({ id: game.id, data: { team1Score: parseInt(e.target.value) } })}
                        data-testid={`team1Score-${game.id}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={game.isLive || false}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: game.id, data: { isLive: checked, isFinal: checked ? false : game.isFinal || false } })}
                      data-testid={`switch-live-${game.id}`}
                    />
                    <Label>Live</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={game.isFinal || false}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: game.id, data: { isFinal: checked, isLive: checked ? false : game.isLive || false } })}
                      data-testid={`switch-final-${game.id}`}
                    />
                    <Label>Final</Label>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewsManager() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const { data: news } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; excerpt: string; authorId: string }) => {
      await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News article published" });
      setTitle("");
      setContent("");
      setExcerpt("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to publish news", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/news/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News article deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete article", variant: "destructive" });
    },
  });

  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Post News</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ title, content, excerpt, authorId: user?.id || "" });
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-news-title" />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required data-testid="input-news-excerpt" />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={10} data-testid="input-news-content" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-post-news">
            {createMutation.isPending ? "Publishing..." : "Publish News"}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {news?.map((article) => (
          <Card key={article.id} className="p-4 flex items-center justify-between" data-testid={`news-article-${article.id}`}>
            <div>
              <p className="font-semibold">{article.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(article.createdAt!), "MMM d, yyyy")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => deleteMutation.mutate(article.id)}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-news-${article.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BracketManager() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: images } = useQuery<any[]>({
    queryKey: ["/api/bracket-images"],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-bracket", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      await apiRequest("POST", "/api/bracket-images", { imageUrl: data.url });
      queryClient.invalidateQueries({ queryKey: ["/api/bracket-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bracket-image"] });
      toast({ title: "Success", description: "Bracket image uploaded" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bracket-images/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bracket-images"] });
      toast({ title: "Success", description: "Bracket image deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Bracket Image</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bracket-file">Choose Image File</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="bracket-file" 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                data-testid="input-bracket-file" 
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('bracket-file')?.click()}
                disabled={uploading}
                className="w-full gap-2"
              >
                <FileUp className="w-4 h-4" />
                {uploading ? "Uploading..." : "Select Bracket Image"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images?.map((img) => (
          <Card key={img.id} className="overflow-hidden" data-testid={`bracket-image-${img.id}`}>
            <img src={img.imageUrl} alt="Bracket" className="w-full h-48 object-cover" />
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(img.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-bracket-${img.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChangelogManager() {
  const { toast } = useToast();
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["NEW"]);
  const [changes, setChanges] = useState("");

  const STATUS_OPTIONS = ["NEW", "IMPROVED", "FIXED", "DESIGN"];

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev => 
      prev.includes(s) 
        ? prev.filter(item => item !== s) 
        : [...prev, s]
    );
  };

  const { data: logs } = useQuery<Changelog[]>({
    queryKey: ["/api/changelogs"],
  });

  const latestVersion = logs && logs.length > 0 ? logs[0].version : "1.0.0";

  useEffect(() => {
    if (logs && logs.length > 0) {
      const latest = logs[0].version;
      const parts = latest.split('.').map(Number);
      if (parts.length >= 2) {
        parts[1] += 1;
        // Keep only major and minor for 1.1, 1.2 format
        setVersion(`${parts[0]}.${parts[1]}`);
      } else {
        setVersion(latest + ".1");
      }
    } else {
      setVersion("1.1");
    }
  }, [logs]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertChangelog) => {
      await apiRequest("POST", "/api/changelogs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelogs"] });
      toast({ title: "Success", description: "Changelog added" });
      setVersion("");
      setTitle("");
      setDescription("");
      setChanges("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add changelog", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Changelog</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              version,
              title,
              description,
              status: JSON.stringify(selectedStatuses),
              changes: JSON.stringify(changes.split('\n').filter(c => c.trim())),
              date: format(new Date(), "yyyy-MM-dd")
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="version">Version</Label>
            <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} required placeholder="e.g. 1.2.0" data-testid="input-changelog-version" />
          </div>
          <div>
            <Label>Status Tags (Select Multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {STATUS_OPTIONS.map((s) => (
                <Badge
                  key={s}
                  variant={selectedStatuses.includes(s) ? "default" : "outline"}
                  className="cursor-pointer uppercase font-black text-[10px] tracking-widest px-3 py-1"
                  onClick={() => toggleStatus(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="log-title">Title</Label>
            <Input id="log-title" value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-changelog-title" />
          </div>
          <div>
            <Label htmlFor="log-desc">Description</Label>
            <Textarea id="log-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} data-testid="input-changelog-desc" />
          </div>
          <div>
            <Label htmlFor="log-changes">Changes (one per line)</Label>
            <Textarea id="log-changes" value={changes} onChange={(e) => setChanges(e.target.value)} required rows={5} data-testid="input-changelog-content" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-add-changelog">
            Add Log
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {logs?.map((log) => (
          <Card key={log.id} className="p-4" data-testid={`changelog-item-${log.id}`}>
            <p className="font-bold">Version {log.version}: {log.title}</p>
            <p className="text-sm text-muted-foreground">
              {log.date}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StreamRequestsManager() {
  const { toast } = useToast();
  const { data: requests } = useQuery<StreamRequest[]>({
    queryKey: ["/api/stream-requests"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/stream-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stream-requests"] });
      toast({ title: "Success", description: "Request status updated" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Broadcast Requests</h2>
      <div className="space-y-4">
        {requests?.map((req) => (
          <Card key={req.id} className="p-4" data-testid={`stream-request-${req.id}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Game {req.gameId}</p>
                <p className="text-sm">User ID: {req.userId}</p>
                <p className="text-sm text-muted-foreground">URL: {req.streamLink}</p>
                <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                  {req.status?.toUpperCase() || "PENDING"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: req.id, status: "approved" })}
                  disabled={updateMutation.isPending || req.status === "approved"}
                  data-testid={`button-approve-stream-${req.id}`}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateMutation.mutate({ id: req.id, status: "rejected" })}
                  disabled={updateMutation.isPending || req.status === "rejected"}
                  data-testid={`button-reject-stream-${req.id}`}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {requests?.length === 0 && <p className="text-center text-muted-foreground">No pending requests</p>}
      </div>
    </Card>
  );
}

function RosterManager() {
  const { toast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");

  const { data: players } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: teamList } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/players", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player added to roster" });
      setPlayerName("");
      setPosition("");
      setJerseyNumber("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add player", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/players/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player removed from roster" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to remove player", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Player</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              name: playerName,
              teamId: selectedTeamId,
              position,
              number: parseInt(jerseyNumber),
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger data-testid="select-player-team">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teamList?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="player-name">Name</Label>
              <Input id="player-name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required data-testid="input-player-name" />
            </div>
            <div>
              <Label htmlFor="player-pos">Position</Label>
              <Input id="player-pos" value={position} onChange={(e) => setPosition(e.target.value)} required placeholder="QB, WR, etc" data-testid="input-player-position" />
            </div>
            <div>
              <Label htmlFor="player-jersey">Jersey #</Label>
              <Input id="player-jersey" type="number" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} required data-testid="input-player-jersey" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending || !selectedTeamId} data-testid="button-add-player">
            Add Player
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players?.filter(p => !selectedTeamId || p.teamId === selectedTeamId).map((player) => (
            <Card key={player.id} className="p-4 flex items-center justify-between" data-testid={`player-card-${player.id}`}>
              <div>
                <p className="font-bold">{player.name}</p>
                <p className="text-sm text-muted-foreground">{player.position} • #{player.number}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(player.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-player-${player.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerStatsManager() {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [stats, setStats] = useState<any>({});

  const { data: players } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/players/${selectedPlayerId}/stats`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player statistics updated" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update stats", variant: "destructive" });
    },
  });

  const POSITIONS = {
    QB: ["passingYards", "passingTouchdowns", "interceptions", "rushingYards", "rushingTouchdowns"],
    RB: ["rushingYards", "rushingTouchdowns", "receptions", "receivingYards", "receivingTouchdowns"],
    WR: ["receptions", "receivingYards", "receivingTouchdowns", "rushingYards", "rushingTouchdowns"],
    TE: ["receptions", "receivingYards", "receivingTouchdowns"],
    K: ["fieldGoalsMade", "fieldGoalsAttempted", "extraPointsMade", "extraPointsAttempted"],
    DEF: ["sacks", "interceptions", "forcedFumbles", "fumblesRecovered", "touchdowns", "pointsAllowed"],
  };

  const selectedPlayer = players?.find(p => p.id === selectedPlayerId);
  const relevantStats = selectedPlayer ? (POSITIONS[selectedPlayer.position as keyof typeof POSITIONS] || []) : [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Update Player Stats</h2>
        <div className="space-y-4">
          <div>
            <Label>Select Player</Label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger data-testid="select-player-stats">
                <SelectValue placeholder="Search Player" />
              </SelectTrigger>
              <SelectContent>
                {players?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.position})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlayer && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantStats.map((stat) => (
                <div key={stat}>
                  <Label htmlFor={stat} className="capitalize">{stat.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input
                    id={stat}
                    type="number"
                    value={stats[stat] ?? 0}
                    onChange={(e) => setStats({ ...stats, [stat]: parseInt(e.target.value) })}
                    data-testid={`input-stat-${stat}`}
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            disabled={updateMutation.isPending || !selectedPlayerId}
            onClick={() => updateMutation.mutate(stats)}
            data-testid="button-save-stats"
          >
            Update Statistics
          </Button>
        </div>
      </Card>
    </div>
  );
}

function UsersManager() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users/all"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiRequest("PATCH", `/api/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
      toast({ title: "Success", description: "User role updated" });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="space-y-4">
        {users?.map((u) => (
          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md gap-4" data-testid={`user-row-${u.id}`}>
            <div className="space-y-1">
              <p className="font-bold text-lg">{u.username}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <p>ID: <span className="text-foreground font-mono text-[10px]">{u.id}</span></p>
                <p>Role: <Badge variant="outline" className="capitalize">{u.role || "user"}</Badge></p>
                <p>Created: <span className="text-foreground">{u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span></p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground sm:hidden">Change Role</Label>
              <Select value={u.role || "user"} onValueChange={(role) => updateRoleMutation.mutate({ id: u.id, role })}>
                <SelectTrigger className="w-full sm:w-40" data-testid={`select-role-${u.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="streamer">Streamer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {users?.length === 0 && <p className="text-center text-muted-foreground">No users found</p>}
      </div>
    </Card>
  );
}

function PartnersManager() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quote, setQuote] = useState("");

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Success", description: "Partner added" });
      setName("");
      setImageFile(null);
      setQuote("");
      // Reset file input
      const fileInput = document.getElementById("partner-logo") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add partner", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/partners/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Success", description: "Partner removed" });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Partner</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name || !quote) {
              toast({ title: "Error", description: "Name and quote are required", variant: "destructive" });
              return;
            }
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("quote", quote.trim());
            if (imageFile) {
              formData.append("image", imageFile);
            }
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner-name">Name</Label>
              <Input id="partner-name" value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-partner-name" />
            </div>
            <div>
              <Label htmlFor="partner-logo">Logo Image (Optional)</Label>
              <Input 
                id="partner-logo" 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                data-testid="input-partner-logo" 
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partner-quote">Quote</Label>
              <Textarea id="partner-quote" value={quote} onChange={(e) => setQuote(e.target.value)} required data-testid="input-partner-website" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-add-partner">
            {createMutation.isPending ? "Adding..." : "Add Partner"}
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {partners?.map((p) => (
          <Card key={p.id} className="p-4 text-center" data-testid={`partner-card-${p.id}`}>
            <img src={p.imageUrl || ""} alt={p.name} className="h-16 mx-auto mb-2" />
            <p className="font-bold">{p.name}</p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-4"
              onClick={() => deleteMutation.mutate(p.id)}
              data-testid={`button-delete-partner-${p.id}`}
            >
              Remove
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamsManager() {
  const { toast } = useToast();
  const { data: teams = [], isLoading } = useTeams();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; logo?: string }) => {
      await apiRequest("POST", "/api/teams", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team created" });
      setNewName(""); setNewLogo("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create team", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      await apiRequest("PATCH", `/api/teams/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team updated" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update team", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/teams/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete team", variant: "destructive" }),
  });

  const startEdit = (team: Team) => {
    setEditingId(team.id);
    setEditName(team.name);
    setEditLogo(team.logo || "");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Team Name *</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Dallas Cowboys" data-testid="input-new-team-name" />
          </div>
          <div>
            <Label>Logo URL (optional)</Label>
            <Input value={newLogo} onChange={e => setNewLogo(e.target.value)} placeholder="https://..." data-testid="input-new-team-logo" />
          </div>
        </div>
        {newLogo && (
          <div className="mt-3 flex items-center gap-2">
            <img src={newLogo} alt="preview" className="h-10 w-10 object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs text-muted-foreground">Logo preview</span>
          </div>
        )}
        <Button
          className="mt-4 gap-2"
          onClick={() => {
            if (!newName.trim()) return toast({ title: "Error", description: "Team name is required", variant: "destructive" });
            createMutation.mutate({ name: newName.trim(), logo: newLogo || undefined });
          }}
          disabled={createMutation.isPending}
          data-testid="button-add-team"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Adding..." : "Add Team"}
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Teams ({teams.length})</h2>
        {isLoading && <p className="text-muted-foreground">Loading teams...</p>}
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="border rounded-lg p-4" data-testid={`team-item-${team.id}`}>
              {editingId === team.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Team Name</Label>
                      <Input value={editName} onChange={e => setEditName(e.target.value)} data-testid={`input-edit-team-name-${team.id}`} />
                    </div>
                    <div>
                      <Label>Logo URL (optional)</Label>
                      <Input value={editLogo} onChange={e => setEditLogo(e.target.value)} placeholder="https://..." data-testid={`input-edit-team-logo-${team.id}`} />
                    </div>
                  </div>
                  {editLogo && (
                    <div className="flex items-center gap-2">
                      <img src={editLogo} alt="preview" className="h-10 w-10 object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Logo preview</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: team.id, data: { name: editName, logo: editLogo || null } as any })}
                      disabled={updateMutation.isPending}
                      data-testid={`button-save-team-${team.id}`}
                    >
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-team-${team.id}`}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-10 w-10 object-contain rounded" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs font-bold">{team.name.substring(0, 2)}</div>
                    )}
                    <div>
                      <p className="font-bold">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{[team.city, team.division].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(team)} data-testid={`button-edit-team-${team.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => { if (confirm(`Delete "${team.name}"?`)) deleteMutation.mutate(team.id); }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-team-${team.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WeekEditor({ season, onClose }: { season: Season; onClose: () => void }) {
  const { toast } = useToast();
  const { data: existing = [], isLoading } = useSeasonWeeks(season.id);
  const [labels, setLabels] = useState<{ weekNumber: number; label: string; isPlayoff: boolean }[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isLoading || initialized) return;
    const generated = Array.from({ length: season.totalWeeks }, (_, i) => {
      const wn = i + 1;
      const existing_ = existing.find(c => c.weekNumber === wn);
      return existing_ ? { weekNumber: wn, label: existing_.label, isPlayoff: existing_.isPlayoff ?? false } : { weekNumber: wn, label: `Week ${wn}`, isPlayoff: false };
    });
    setLabels(generated);
    setInitialized(true);
  }, [existing, isLoading, season.totalWeeks, initialized]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/seasons/${season.id}/weeks`, { configs: labels });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["/api/seasons", season.id, "weeks"] });
      queryClient.refetchQueries({ queryKey: ["/api/seasons/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({ title: "Success", description: "Week names saved" });
      onClose();
    },
    onError: () => toast({ title: "Error", description: "Failed to save week names", variant: "destructive" }),
  });

  const updateLabel = (idx: number, label: string) => setLabels(prev => prev.map((l, i) => i === idx ? { ...l, label } : l));
  const togglePlayoff = (idx: number) => setLabels(prev => prev.map((l, i) => i === idx ? { ...l, isPlayoff: !l.isPlayoff } : l));

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Loading week config…</div>;

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-2xl border border-border/30 space-y-3">
      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Week Names for {season.name}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
        {labels.map((l, idx) => (
          <div key={l.weekNumber} className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground/50 w-6 shrink-0">W{l.weekNumber}</span>
            <Input
              value={l.label}
              onChange={e => updateLabel(idx, e.target.value)}
              className="h-8 text-xs"
              data-testid={`input-week-label-${l.weekNumber}`}
            />
            <button
              onClick={() => togglePlayoff(idx)}
              title="Mark as playoff week"
              className={`shrink-0 text-[10px] font-black px-1.5 py-1 rounded-lg border transition-colors ${l.isPlayoff ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border/30 text-muted-foreground/40 hover:border-border/60'}`}
              data-testid={`button-playoff-${l.weekNumber}`}
            >
              PO
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2" data-testid="button-save-week-names">
          <Save className="w-3.5 h-3.5" />
          {saveMutation.isPending ? "Saving…" : "Save Week Names"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

function SeasonsManager() {
  const { toast } = useToast();
  const { data: seasonList = [], isLoading } = useAllSeasons();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeeks, setEditWeeks] = useState("15");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newWeeks, setNewWeeks] = useState("15");

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/seasons", {
        number: Number(newNumber),
        name: newName,
        totalWeeks: Number(newWeeks) || 15,
        status: "upcoming",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({ title: "Season created" });
      setNewName(""); setNewNumber(""); setNewWeeks("15");
    },
    onError: (e: any) => toast({ title: "Error", description: e?.message || "Failed to create season", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/seasons/${id}`, { name: editName, totalWeeks: Number(editWeeks) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({ title: "Season updated" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/seasons/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({ title: "Season activated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to activate", variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/seasons/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({ title: "Season archived" });
    },
    onError: () => toast({ title: "Error", description: "Failed to archive", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/seasons/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({ title: "Season deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const startEdit = (s: Season) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditWeeks(String(s.totalWeeks));
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-500/20 text-green-400 border-none text-[9px] font-black uppercase">Active</Badge>;
    if (status === "archived") return <Badge className="bg-muted/50 border-none text-[9px] font-black uppercase">Archived</Badge>;
    return <Badge className="bg-amber-500/20 text-amber-400 border-none text-[9px] font-black uppercase">Upcoming</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Season</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Season # *</Label>
            <Input type="number" value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="e.g. 3" data-testid="input-new-season-number" />
          </div>
          <div>
            <Label>Name *</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Season 3" data-testid="input-new-season-name" />
          </div>
          <div>
            <Label>Total Weeks</Label>
            <Input type="number" value={newWeeks} onChange={e => setNewWeeks(e.target.value)} min={1} max={30} data-testid="input-new-season-weeks" />
          </div>
        </div>
        <Button
          className="mt-4 gap-2"
          disabled={createMutation.isPending || !newName.trim() || !newNumber}
          onClick={() => createMutation.mutate()}
          data-testid="button-create-season"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Creating…" : "Create Season"}
        </Button>
      </Card>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">All Seasons</h3>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading seasons…</div>
        ) : seasonList.length === 0 ? (
          <div className="text-muted-foreground text-sm">No seasons yet.</div>
        ) : seasonList.map(s => (
          <Card key={s.id} className="p-5 space-y-3">
            {editingId === s.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Season Name</Label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} data-testid={`input-edit-season-name-${s.id}`} />
                  </div>
                  <div>
                    <Label>Total Weeks</Label>
                    <Input type="number" value={editWeeks} onChange={e => setEditWeeks(e.target.value)} min={1} max={30} data-testid={`input-edit-season-weeks-${s.id}`} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate(s.id)} disabled={updateMutation.isPending} className="gap-2">
                    <Save className="w-3.5 h-3.5" /> {updateMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black italic text-muted-foreground/20">S{s.number}</div>
                  <div>
                    <div className="font-black uppercase tracking-tight flex items-center gap-2">
                      {s.name}
                      {statusBadge(s.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.totalWeeks} weeks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="gap-1.5 text-xs" data-testid={`button-expand-weeks-${s.id}`}>
                    {expandedId === s.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Week Names
                  </Button>
                  {s.status !== "active" && (
                    <Button size="sm" variant="outline" onClick={() => activateMutation.mutate(s.id)} disabled={activateMutation.isPending} className="gap-1.5 text-xs text-green-500 border-green-500/30 hover:bg-green-500/10" data-testid={`button-activate-season-${s.id}`}>
                      <PlayCircle className="w-3 h-3" /> Activate
                    </Button>
                  )}
                  {s.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => archiveMutation.mutate(s.id)} disabled={archiveMutation.isPending} className="gap-1.5 text-xs" data-testid={`button-archive-season-${s.id}`}>
                      <Archive className="w-3 h-3" /> Archive
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => startEdit(s)} className="gap-1.5 text-xs" data-testid={`button-edit-season-${s.id}`}>
                    <Edit className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete ${s.name}? This won't delete its games.`)) deleteMutation.mutate(s.id); }} disabled={deleteMutation.isPending} className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" data-testid={`button-delete-season-${s.id}`}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            )}
            {expandedId === s.id && (
              <WeekEditor season={s} onClose={() => setExpandedId(null)} />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsManager() {
  const { toast } = useToast();
  const { data: maintenanceStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/settings/maintenance-mode"],
  });
  const { data: breakingNews } = useQuery<{ message: string; active: boolean; expiresAt: string | null }>({
    queryKey: ["/api/settings/breaking-news"],
  });

  const [newsMessage, setNewsMessage] = useState("");
  const [duration, setDuration] = useState("60");

  useEffect(() => {
    if (breakingNews?.message) {
      setNewsMessage(breakingNews.message);
    }
  }, [breakingNews]);

  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("POST", "/api/settings/maintenance-mode", { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/maintenance-mode"] });
      toast({ title: "Success", description: "Maintenance mode updated" });
    },
  });

  const updateBreakingNewsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/settings/breaking-news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/breaking-news"] });
      toast({ title: "Success", description: "Breaking news updated" });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">System Settings</h2>
        <div className="flex items-center gap-4">
          <Switch
            checked={maintenanceStatus?.enabled || false}
            onCheckedChange={toggleMaintenanceMutation.mutate}
            data-testid="switch-maintenance"
          />
          <Label>Maintenance Mode (Block user access)</Label>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Breaking News Alert</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="breaking-news-msg">Alert Message</Label>
            <Input
              id="breaking-news-msg"
              value={newsMessage}
              onChange={(e) => setNewsMessage(e.target.value)}
              placeholder="Enter critical update message..."
              data-testid="input-breaking-news"
            />
          </div>
          <div>
            <Label htmlFor="breaking-news-duration">Duration (Minutes)</Label>
            <Input
              id="breaking-news-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
              data-testid="input-breaking-news-duration"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => updateBreakingNewsMutation.mutate({ 
                message: newsMessage, 
                active: true,
                durationMinutes: parseInt(duration) || 60
              })}
              disabled={updateBreakingNewsMutation.isPending || !newsMessage}
              data-testid="button-activate-breaking-news"
            >
              Activate Alert
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewsMessage("");
                updateBreakingNewsMutation.mutate({ message: "", active: false });
              }}
              disabled={updateBreakingNewsMutation.isPending}
              data-testid="button-deactivate-breaking-news"
            >
              Deactivate
            </Button>
          </div>
          {breakingNews?.active && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Current Alert: "{breakingNews.message}" 
              {breakingNews.expiresAt && ` (Expires: ${new Date(breakingNews.expiresAt).toLocaleTimeString()})`}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
