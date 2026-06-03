import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/GameCard";
import type { Game, News as NewsType } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { ArrowRight, Trophy, Newspaper, Zap, Calendar, BarChart3, Target, Sparkles, Wrench, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { SiteTour } from "@/components/SiteTour";
import { useActiveSeason } from "@/hooks/useSeasons";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: activeSeason } = useActiveSeason();
  const seasonNumber = activeSeason?.number;

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/current", seasonNumber],
    queryFn: async () => {
      const res = await fetch(`/api/games/current?season=${seasonNumber}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
    enabled: seasonNumber != null,
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const { data: maintenanceStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/settings/maintenance-mode"],
  });

  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const currentWeek = games && games.length > 0 ? games[0].week : 1;
  const featuredNews = news?.slice(0, 3) || [];
  const liveGames = games?.filter(g => g.isLive) || [];
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && (user as any).hasCompletedTour === false) {
      setShowTour(true);
    } else {
      setShowTour(false);
    }
  }, [isAuthenticated, user]);

  if (maintenanceStatus?.enabled && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-12 border-none bg-card/50 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
            <Wrench className="w-20 h-20 text-accent relative z-10 mx-auto" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Maintenance</h1>
          <p className="text-muted-foreground font-medium">Updating the hub for a better experience. Back soon!</p>
          <Button onClick={() => setLocation("/login")} variant="outline" className="w-full">Admin Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        
        {/* Hero Section */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-1000" />
          <Card className="relative overflow-hidden border-none bg-card/40 backdrop-blur-3xl p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Season 2 Live Now
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
                  The Hub <br /><span className="text-primary">of CFG</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
                  Experience football like never before. Real-time scores, deep analytics, and the best community in the league.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => setLocation("/scores")} className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs bg-primary hover:scale-105 transition-transform w-full sm:w-auto">
                    <Zap className="w-4 h-4 mr-2" />
                    Live Scores
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setLocation("/schedule")} className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs border-white/10 hover:bg-white/5 transition-all w-full sm:w-auto">
                    Full Schedule
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block relative">
                <div className="absolute -inset-20 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="relative grid grid-cols-2 gap-4">
                  <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10 rotate-3 translate-y-8">
                    <Trophy className="w-12 h-12 text-accent mb-4" />
                    <p className="text-3xl font-black italic">W12</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Playoffs Ready</p>
                  </Card>
                  <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10 -rotate-3">
                    <Zap className="w-12 h-12 text-primary mb-4" />
                    <p className="text-3xl font-black italic">{liveGames.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Games</p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 text-[300px] opacity-[0.02] select-none font-black italic pointer-events-none">CFG</div>
          </Card>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Main Feed */}
          <div className="xl:col-span-2 space-y-12">
            
            {/* Games Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-primary rounded-full" />
                  Matchups <span className="text-muted-foreground/30 ml-2">W{currentWeek}</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/scores")} className="font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {gamesLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-3xl bg-card/50" />
                  ))}
                </div>
              ) : games && games.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {games.slice(0, 4).map((game) => (
                    <GameCard key={game.id} game={game} onClick={() => setLocation(`/game/${game.id}`)} />
                  ))}
                </div>
              ) : (
                <Card className="p-16 text-center border-dashed border-2 border-white/5 bg-transparent rounded-3xl">
                  <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No Scheduled Games</p>
                </Card>
              )}
            </div>

            {/* News Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-accent rounded-full" />
                  Fresh Intel
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/news")} className="font-bold text-[10px] uppercase tracking-widest text-accent hover:bg-accent/5">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {newsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-3xl bg-card/50" />
                  ))}
                </div>
              ) : featuredNews.length > 0 ? (
                <div className="grid gap-4">
                  {featuredNews.map((post) => (
                    <Link key={post.id} href={`/news/${post.id}`}>
                      <Card className="group p-6 bg-card/40 backdrop-blur-xl border-border/40 hover:bg-card/60 transition-all duration-300 rounded-3xl cursor-pointer">
                        <div className="flex gap-6">
                          <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Newspaper className="w-8 h-8 text-white/50" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              {format(new Date(post.createdAt!), "MMM d • HH:mm")}
                            </p>
                            <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {post.excerpt || post.content}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <Card className="p-8 bg-primary rounded-[40px] border-none shadow-2xl shadow-primary/20 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Season 2 <br />Dashboard</h3>
                <div className="space-y-4">
                  {[
                    { label: "Current Week", value: `W${currentWeek}`, icon: Calendar },
                    { label: "Total Matchups", value: games?.length || 0, icon: Target },
                    { label: "Live Broadcasts", value: liveGames.length, icon: PlayCircle },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-white/60" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black italic text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => setLocation("/standings")} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white text-primary hover:bg-white/90">
                  Full Standings
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Fast Tracks</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: "Live", path: "/scores", bg: "bg-primary/5", text: "text-primary" },
                  { icon: BarChart3, label: "Stats", path: "/standings", bg: "bg-accent/5", text: "text-accent" },
                  { icon: Trophy, label: "Playoffs", path: "/playoffs", bg: "bg-white/5", text: "text-foreground" },
                  { icon: Calendar, label: "Schedule", path: "/schedule", bg: "bg-white/5", text: "text-foreground" },
                ].map((item, i) => (
                  <Button key={i} variant="ghost" onClick={() => setLocation(item.path)} className={`h-24 flex flex-col gap-3 rounded-[32px] border border-border/40 ${item.bg} hover:scale-105 transition-all group`}>
                    <item.icon className={`w-6 h-6 ${item.text} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTour && <SiteTour onComplete={() => setShowTour(false)} />}
    </div>
  );
}
