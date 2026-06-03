import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollText, Shield, Gavel, Users, AlertTriangle, Star } from "lucide-react";

interface RuleSection {
  title: string;
  icon: React.ReactNode;
  rules: Rule[];
}

interface Rule {
  title: string;
  penalty?: string;
  content: string[];
}

const RULEBOOK: RuleSection[] = [
  {
    title: "Game Standards",
    icon: <Shield className="w-5 h-5" />,
    rules: [
      {
        title: "Voting",
        content: [
          "The following must be voted upon entering the game:",
          "• Team Selection: Captain",
          "• QB Boundaries: No",
          "• Fumble Chance: 1%",
          "• Weather: Clear",
          "• Formation: Classic",
        ],
      },
      {
        title: "Links",
        content: ["The higher seed can force their VIP link."],
      },
      {
        title: "Gamepasses",
        content: [
          "All gamepasses are allowed. Players with inappropriate jersey names may be subject to punishment by the Justice Department.",
        ],
      },
      {
        title: "Pclocks",
        content: [
          "A free pclock is given at the beginning of the game for setting up and getting players in and off the field.",
          "After that, a team is limited to only 3 PCLOCKS TOTAL.",
          "A /pclock 60 counts as 1 pclock. A /pclock 99 counts as 2 pclocks total.",
          "If a team goes past their allotted pclocks, they could be subject to punishment.",
        ],
      },
      {
        title: "Player Eligibility",
        content: [
          "ALL PLAYERS MUST BE SIGNED BEFORE KICKOFF.",
          "If a player is signed after kickoff, it may result in punishment of the player and the team might be subject to a FFL.",
          "All players must be VERIFIED.",
        ],
      },
    ],
  },
  {
    title: "Game Rules",
    icon: <Gavel className="w-5 h-5" />,
    rules: [
      {
        title: "Angling",
        content: [
          "Angling is strictly prohibited in this league.",
          "If you angle swat, it is a spot foul.",
          "If angle swatted in the endzone, the team will be placed at the one.",
        ],
      },
      {
        title: "Grounding",
        penalty: "15 yard penalty",
        content: [
          "If the quarterback throws it into the stands, it is automatically called grounding.",
          "If they throw it at the ground, it's grounding.",
          "IF THE QUARTERBACK DOES GROUNDING IN THE ENDZONE, IT IS A SAFETY.",
          "If you want to challenge grounding, just open a ticket for the Referee Department.",
        ],
      },
      {
        title: "4th & 25",
        content: [
          "If you are losing in the 4th quarter, you are allowed to 4th and 25.",
          "All rules apply to 4th and 25. You can also onside if you want.",
          "YOU MAY ONLY HAVE ONE PERSON BLOCK ON 4TH AND 25 (OLINE). No chipping.",
          "4th and 25 Commands:",
          "/newplay -35",
          "/tv",
          "/newplay 25",
          "/down 4",
        ],
      },
      {
        title: "OL Rollout",
        penalty: "10 yard penalty",
        content: [
          "If the Oline blocks past 5 yards behind the LOS and rolls out, it is an automatic 10 yard penalty.",
        ],
      },
      {
        title: "Forcing",
        content: [
          "Forcing is only allowed for 7v8. NO 8V9s.",
          "The team can not run. However, the team being forced against can run.",
        ],
      },
      {
        title: "Milking",
        content: [
          "Milking is only allowed in the last minute of the 2nd and 4th quarter.",
          "If a team runs down 10 seconds of pclock or less, IT IS NOT MILKING.",
          "If you want to challenge milking, just open a referee ticket and say /mm challenge.",
        ],
      },
      {
        title: "Double Blocking",
        penalty: "5 yard penalty",
        content: [
          "You cannot have more than one player block and rollout (2 TE).",
          "The TE must rollout before or at 5 yards of blocking behind the LOS.",
          "A WR of any circumstance CANNOT block a DE. (Except the Tightend)",
        ],
      },
      {
        title: "Stacking",
        penalty: "10 yard penalty & loss of down",
        content: [
          "If a player gets on top of another player for an advantage, it is called stacking.",
          "BOOSTING IS ALLOWED, AND IS NOT STACKING.",
        ],
      },
      {
        title: "Challenging",
        content: [
          "To challenge, say /mm challenge either during the play or the play after the play being challenged.",
          "Open a ticket. Post-Game Challenges ARE allowed.",
        ],
      },
      {
        title: "Mercy Rule",
        content: [
          "If a team is up by 35 points at any point of the game, it is considered a mercy rule.",
          "If both Franchise Owners agree to keep going, that is fine and will not be considered stat-padding.",
          "If you continue and they deny to keep going, it is considered stat-padding and you will be FFLed.",
        ],
      },
      {
        title: "Stat-Padding",
        content: ["The game will still count, but stats will not."],
      },
      {
        title: "Walkons",
        content: [
          "Only one walkon allowed per game.",
          "A walkon cannot be signed to another team.",
        ],
      },
      {
        title: "Admin Abuse",
        content: [
          "Admin Abuse will NOT be tolerated and will be decided as an instant FFL if it has any affect toward the game.",
          "This is not overturnable.",
        ],
      },
    ],
  },
  {
    title: "Franchise Rules",
    icon: <Users className="w-5 h-5" />,
    rules: [
      {
        title: "Past Deadline Signing",
        content: [
          "The signing deadline will be placed 2 seasonal weeks before playoffs.",
          "You MUST pay after the signing deadline is active.",
          "Failure to do so will result in unrolling the signed player and a suspension to the Franchise Owner, Team President, Head Coach, or Assistant Coach.",
          "Signing fees:",
          "• Sweet 16 — $2 / 200 RBX",
          "• Elite 8 — $4 / 400 RBX",
          "• Final 4 — $6 / 600 RBX",
          "• Celestial Bowl — $8 / 800 RBX",
        ],
      },
    ],
  },
];

const PENALTY_COLOR_MAP: Record<string, string> = {
  "15 yard penalty": "bg-red-500/20 text-red-400 border-red-500/30",
  "10 yard penalty": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "5 yard penalty": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "10 yard penalty & loss of down": "bg-red-600/20 text-red-300 border-red-600/30",
};

export default function Rulebook() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-full w-fit">
            <ScrollText className="w-3.5 h-3.5 mr-2" />
            Official League Document
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
            CFG <span className="text-primary">Rulebook</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
            Official rules and regulations governing all CFG league games and franchise operations.
          </p>
        </div>

        {/* Quick reference banner */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-[28px] flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium leading-relaxed text-foreground/80">
            All players and franchise members are expected to know and follow these rules. Violations may result in penalties, forfeit losses (FFL), or suspensions as determined by the Referee and Justice Departments.
          </p>
        </Card>

        {/* Sections */}
        <div className="space-y-16">
          {RULEBOOK.map((section) => (
            <div key={section.title} className="space-y-8">
              {/* Section header */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {section.icon}
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{section.title}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
              </div>

              {/* Rules grid */}
              <div className="space-y-4">
                {section.rules.map((rule) => (
                  <Card
                    key={rule.title}
                    className="p-6 sm:p-8 bg-card/40 backdrop-blur-xl border-border/40 rounded-[28px] space-y-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <h3 className="text-lg font-black italic uppercase tracking-tight">{rule.title}</h3>
                      </div>
                      {rule.penalty && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            PENALTY_COLOR_MAP[rule.penalty] ?? "bg-destructive/20 text-destructive border-destructive/30"
                          }`}
                        >
                          {rule.penalty}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 pl-5 border-l-2 border-primary/20">
                      {rule.content.map((line, i) => {
                        const isCommand = line.startsWith("/");
                        const isBullet = line.startsWith("•");
                        const isHeading = line.endsWith(":");
                        return (
                          <p
                            key={i}
                            className={`text-sm leading-relaxed ${
                              isCommand
                                ? "font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg inline-block"
                                : isBullet
                                ? "text-foreground/80 font-medium pl-2"
                                : isHeading
                                ? "font-black text-foreground/90 uppercase tracking-wider text-xs mt-3"
                                : "text-foreground/70 font-medium"
                            }`}
                          >
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <Card className="p-8 bg-card/20 border-border/20 rounded-[32px] text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">More rules coming soon</p>
          <p className="text-xs text-muted-foreground/30 font-medium">Questions? Open a ticket in the CFG Discord server.</p>
        </Card>
      </div>
    </div>
  );
}
