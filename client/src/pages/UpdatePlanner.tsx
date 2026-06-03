import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import type { UpdatePlan } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Wrench, Sparkles, Trash2, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UpdatePlanner() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";

  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState("");

  const { data: plans } = useQuery<UpdatePlan[]>({
    queryKey: ["/api/update-plans"],
  });

  const addMutation = useMutation({
    mutationFn: async ({ date, message }: { date: string; message: string }) => {
      await apiRequest("POST", "/api/update-plans", { updateDate: date, message: message || null });
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["/api/update-plans"] });
      toast({ title: "Update scheduled" });
      setPendingDate(null);
      setPendingMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not schedule update", variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (date: string) => {
      await apiRequest("DELETE", `/api/update-plans/${date}`, undefined);
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["/api/update-plans"] });
      toast({ title: "Update removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not remove update", variant: "destructive" });
    },
  });

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(2026, 11, 31);

  const months: Date[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    months.push(new Date(d));
  }

  const plansMap = new Map(plans?.map(p => [p.updateDate, p]) ?? []);

  const scheduledDates = plans
    ? [...plans].sort((a, b) => a.updateDate.localeCompare(b.updateDate))
    : [];

  const handleDayClick = (dateStr: string, hasUpdate: boolean) => {
    if (!isAdmin) return;
    if (hasUpdate) {
      removeMutation.mutate(dateStr);
    } else {
      setPendingDate(dateStr);
      setPendingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            <Wrench className="w-3.5 h-3.5 mr-2" />
            Product Roadmap
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Update <span className="text-primary">Planner</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            Stay informed about upcoming features, maintenance windows, and league updates.
          </p>
          {isAdmin && (
            <p className="text-xs text-primary/60 font-bold uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-3 h-3" /> Click any day to schedule · Click a scheduled day to remove
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr,350px] gap-12">
          <div className="grid gap-12">
            {months.map((month) => {
              const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

              return (
                <div key={format(month, "yyyy-MM")} className="space-y-6">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-primary rounded-full" />
                    {format(month, "MMMM yyyy")}
                  </h2>
                  <Card className="p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[40px]">
                    <div className="grid grid-cols-7 gap-2 sm:gap-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center font-black text-[10px] text-muted-foreground/40 uppercase tracking-widest py-2">
                          {day}
                        </div>
                      ))}
                      {/* Empty leading cells */}
                      {Array.from({ length: startOfMonth(month).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const plan = plansMap.get(dateStr);
                        const hasUpdate = !!plan;
                        const isCurrentMonth = isSameMonth(day, month);

                        return (
                          <div
                            key={dateStr}
                            onClick={() => isAdmin && handleDayClick(dateStr, hasUpdate)}
                            data-testid={`day-${dateStr}`}
                            title={plan?.message || undefined}
                            className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-black transition-all relative group/day select-none ${
                              !isCurrentMonth
                                ? "opacity-10 pointer-events-none"
                                : hasUpdate
                                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                                : isAdmin
                                ? "bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 text-foreground/40 cursor-pointer"
                                : "bg-white/5 border border-white/5 text-foreground/40"
                            }`}
                          >
                            {format(day, "d")}
                            {hasUpdate && (
                              <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {isAdmin && hasUpdate && (
                              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/day:opacity-100 transition-opacity flex items-center justify-center bg-destructive/80">
                                <Trash2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {isAdmin && !hasUpdate && (
                              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/day:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <aside className="space-y-8">
            <Card className="p-8 bg-primary rounded-[40px] border-none shadow-2xl shadow-primary/20 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Planner <br />Legend</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Planned</p>
                      <p className="text-sm font-bold text-white">Update Scheduled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Regular</p>
                      <p className="text-sm font-bold text-white/80">Standard Operation</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                        <Plus className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Admin</p>
                        <p className="text-sm font-bold text-white/80">Click to add · Click to remove</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {scheduledDates.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Scheduled Updates</h4>
                <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/40 rounded-[32px] space-y-3">
                  {scheduledDates.map((plan) => (
                    <div key={plan.updateDate} className="group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm font-bold">{format(new Date(plan.updateDate + 'T12:00:00'), "MMM d, yyyy")}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => removeMutation.mutate(plan.updateDate)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            data-testid={`button-remove-plan-${plan.updateDate}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {plan.message && (
                        <p className="text-xs text-muted-foreground/60 pl-5 mt-0.5">{plan.message}</p>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Add Update Dialog */}
      <Dialog open={!!pendingDate} onOpenChange={(open) => { if (!open) { setPendingDate(null); setPendingMessage(""); } }}>
        <DialogContent className="sm:max-w-md rounded-[28px] border-border/40 bg-card/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
              Schedule Update
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-bold text-sm">
                {pendingDate ? format(new Date(pendingDate + 'T12:00:00'), "MMMM d, yyyy") : ""}
              </span>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Message <span className="text-muted-foreground/40 normal-case font-normal tracking-normal">— optional</span>
              </Label>
              <Input
                placeholder="e.g. UI overhaul, live score fixes…"
                value={pendingMessage}
                onChange={(e) => setPendingMessage(e.target.value)}
                className="h-11 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pendingDate) {
                    addMutation.mutate({ date: pendingDate, message: pendingMessage });
                  }
                }}
                autoFocus
                data-testid="input-update-message"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setPendingDate(null); setPendingMessage(""); }} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => pendingDate && addMutation.mutate({ date: pendingDate, message: pendingMessage })}
              disabled={addMutation.isPending}
              className="rounded-xl font-black uppercase tracking-widest text-xs px-6"
              data-testid="button-confirm-schedule"
            >
              {addMutation.isPending ? "Scheduling…" : "Schedule Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
