import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Users,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  const rules = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Player Setup",
      description:
        "2-8 players can participate. Teams are auto-distributed fairly based on player count.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Fair Matchups",
      description:
        "No player's teams will face each other in Round 1. This ensures fair competition from the start.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Single Elimination",
      description:
        "Teams progress via single-leg knockout matches. One loss and you're out!",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Interactive Progression",
      description:
        "Click on the winning team after each match to advance them to the next round.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Limit",
      description:
        "Tournament designed to complete under 4 hours total play time.",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Championship",
      description:
        "Final match decides the champion. Optional 3rd place match between semifinal losers.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1628]">
      <div className="max-w-4xl container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-[#d4af37]">
            Tournament Rules
          </h1>
          <Link href="/">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
          </Link>
        </div>

        <div className=" mx-auto">
          {/* Main Rules Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {rules.map((rule, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-md border-white/10"
              >
                <CardHeader>
                  <CardTitle className="text-[#f6cf6e] flex items-center gap-3">
                    {rule.icon}
                    {rule.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tournament Structure */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-[#f6cf6e]">Tournament Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/90">
                <h3 className="font-semibold mb-2 text-[#0e1628]">
                  Team Selection Process:
                </h3>
                <ul className="space-y-1 ml-4">
                  <li>
                    • <strong>4 or fewer players:</strong> Each player chooses 4
                    teams (16 total teams)
                  </li>
                  <li>
                    • <strong>More than 4 players:</strong> Each player chooses
                    2-3 teams from available pool
                  </li>
                  <li>• Players select from 30 top football clubs worldwide</li>
                  <li>
                    • No duplicate teams - each team can only be chosen once
                  </li>
                  <li>
                    • Players navigate through selection interface to pick their
                    teams
                  </li>
                </ul>
              </div>

              <div className="text-white/90">
                <h3 className="font-semibold mb-2 text-[#0e1628]">
                  Bracket Progression:
                </h3>
                <ul className="space-y-1 ml-4">
                  <li>
                    • <strong>Round 1:</strong> Round of 16 (or adjusted based
                    on team count)
                  </li>
                  <li>
                    • <strong>Round 2:</strong> Quarterfinals
                  </li>
                  <li>
                    • <strong>Round 3:</strong> Semifinals
                  </li>
                  <li>
                    • <strong>Round 4:</strong> Final + 3rd Place Match
                    (optional)
                  </li>
                </ul>
              </div>

              <div className="text-white/90">
                <h3 className="font-semibold mb-2 text-[#0e1628]">
                  Match Rules:
                </h3>
                <ul className="space-y-1 ml-4">
                  <li>• Each match is a single game (no home/away legs)</li>
                  <li>• Standard FC 25 match settings apply</li>
                  <li>• Winner advances, loser is eliminated</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-[#0a0f1f] via-[#1e3a8a] to-[#b68a2e] hover:from-[#1e3a8a] hover:to-[#b68a2e]">
                Start New Tournament
              </Button>
            </Link>
            <Link href="/bracket">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                Continue Existing Tournament
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
