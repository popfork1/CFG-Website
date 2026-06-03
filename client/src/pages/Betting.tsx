import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, AlertTriangle, Construction } from "lucide-react";

export default function Betting() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Construction className="w-24 h-24 text-primary relative mx-auto" />
        </div>
        
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5 mr-2" />
            System Offline
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-tight text-foreground">
            Betting is <span className="text-primary">Disabled</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            The betting system is currently undergoing a major overhaul for Season 2. 
            All features will be fully restored in the next project update.
          </p>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          Check back after the next update
        </p>
      </div>
    </div>
  );
}
