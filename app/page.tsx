"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Zap,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(4);
  const [teamsPerPlayer, setTeamsPerPlayer] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerTeams, setPlayerTeams] = useState<{ [key: string]: string[] }>(
    {}
  );
  const router = useRouter();

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = Array(count)
      .fill("")
      .map((_, i) => playerNames[i] || `Player ${i + 1}`);
    setPlayerNames(newNames);
  };

  const handleTeamsPerPlayerChange = (count: number) => {
    setTeamsPerPlayer(count);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const proceedToTeamSelection = () => {
    const initialPlayerTeams: { [key: string]: string[] } = {};
    playerNames.forEach((name) => {
      initialPlayerTeams[name] = Array(teamsPerPlayer).fill("");
    });
    setPlayerTeams(initialPlayerTeams);
    setStep(2);
  };

  const handleTeamNameChange = (teamIndex: number, teamName: string) => {
    const currentPlayer = playerNames[currentPlayerIndex];
    const updatedPlayerTeams = { ...playerTeams };

    if (!updatedPlayerTeams[currentPlayer]) {
      updatedPlayerTeams[currentPlayer] = Array(teamsPerPlayer).fill("");
    }

    updatedPlayerTeams[currentPlayer][teamIndex] = teamName;

    setPlayerTeams(updatedPlayerTeams);
  };

  const hasPlayerDuplicates = (playerName: string) => {
    const teams = playerTeams[playerName] || [];
    const nonEmptyTeams = teams.filter(
      (team) => team && team.trim().length > 0
    );
    const uniqueTeams = new Set(
      nonEmptyTeams.map((t) => t.toLowerCase().trim())
    );
    return nonEmptyTeams.length !== uniqueTeams.size;
  };

  const getTournamentFormat = () => {
    const totalTeams = Object.values(playerTeams)
      .flat()
      .filter((team) => team.trim().length > 0).length;
    const validKnockoutSizes = [2, 4, 8, 16, 32];
    return validKnockoutSizes.includes(totalTeams) ? "knockout" : "league";
  };

  const startTournament = () => {
    const totalTeams = Object.values(playerTeams)
      .flat()
      .filter((team) => team.trim().length > 0).length;
    const format = getTournamentFormat();

    localStorage.setItem(
      "tournamentData",
      JSON.stringify({
        players: playerNames,
        playerTeams,
        totalTeams,
        format,
      })
    );

    if (format === "knockout") {
      router.push("/bracket");
    } else {
      router.push("/league");
    }
  };

  const canProceedToTeamSelection = playerNames.every(
    (name) => name.trim().length > 0
  );
  const currentPlayer = playerNames[currentPlayerIndex];
  const currentPlayerTeams = playerTeams[currentPlayer] || [];

  const allPlayersComplete = playerNames.every((name) => {
    const teams = playerTeams[name] || [];
    return (
      teams.length === teamsPerPlayer &&
      teams.every((team) => team && team.trim().length > 0) &&
      !hasPlayerDuplicates(name)
    );
  });

  const goToPreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };

  const goToNextPlayer = () => {
    if (currentPlayerIndex < playerNames.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#1e3a8a] to-[#b68a2e]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image src="/logo.png" width={200} height={200} alt="trophy" />
              <div className="text-start">
                <h1 className="text-5xl font-bold text-[#d4af37]">
                  FC Ultimate Showdown
                </h1>
                <p className="text-xl text-[#0e1628]">
                  Manage competitive online tournaments for FC 25
                </p>
                <p className="text-white">
                  Developed By <Link className="text-[#f6cf6e] hover:text-[#1e3a8a]" href="https://elox.vercel.app"> Elox</Link>
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Setup Card */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-[#f6cf6e] flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Tournament Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Player Count */}
                <div>
                  <Label className="text-white mb-3 block">
                    Number of Players
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                      <Button
                        key={count}
                        variant={playerCount === count ? "default" : "outline"}
                        className={
                          playerCount === count
                            ? "bg-[#d4af37] hover:bg-[#f6cf6e]"
                            : "border-white/30 text-[#d4af37] hover:bg-white/10"
                        }
                        onClick={() => handlePlayerCountChange(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Teams per Player */}
                <div>
                  <Label className="text-white mb-3 block">
                    Teams per Player
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((count) => (
                      <Button
                        key={count}
                        variant={
                          teamsPerPlayer === count ? "default" : "outline"
                        }
                        className={
                          teamsPerPlayer === count
                            ? "bg-[#d4af37] hover:bg-[#f6cf6e]"
                            : "border-white/30 text-[#d4af37] hover:bg-white/10"
                        }
                        onClick={() => handleTeamsPerPlayerChange(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Player Names */}
                <div>
                  <Label className="text-white mb-3 block">Player Names</Label>
                  <div className="space-y-3">
                    {playerNames.map((name, index) => (
                      <Input
                        key={index}
                        placeholder={`Player ${index + 1}`}
                        value={name}
                        onChange={(e) =>
                          handlePlayerNameChange(index, e.target.value)
                        }
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={proceedToTeamSelection}
                  disabled={!canProceedToTeamSelection}
                  className="w-full bg-gradient-to-r from-yellow-600 to-[#d4af37] hover:from-[#d4af37] hover:to-yellow-600 text-white font-bold py-3"
                >
                  <ChevronRight className="h-5 w-5 mr-2" />
                  Choose Teams
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-[#f6cf6e]">
                  Tournament Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white/90">
                  <h3 className="font-semibold mb-2">Team Selection:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Each player chooses {teamsPerPlayer} teams</li>
                    <li>• Players can have same teams as others</li>
                    <li>• No duplicate teams within your own stack</li>
                  </ul>
                </div>

                <div className="text-white/90">
                  <h3 className="font-semibold mb-2">Tournament Format:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Knockout format for 2, 4, 8, 16 teams</li>
                    <li>• League format for other team counts</li>
                    <li>• League: Win=3pts, Draw=1pt, Loss=0pts</li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => router.push("/rules")}
                >
                  View Full Rules
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1f]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#b68a2e] mb-2">Team Selection</h1>
          <p className="text-white">
            Each player enters {teamsPerPlayer} team names
          </p>
        </div>

        {/* Tournament Format Info */}
        <Card className="bg-[#b68a2e]/10 backdrop-blur-md border-[#d4af37]/20 mx-auto mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <Info className="h-5 w-5" />
              <span className="font-medium">
                Format:{" "}
                {getTournamentFormat() === "knockout"
                  ? "Knockout Tournament"
                  : "League Table"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Player Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button
            onClick={goToPreviousPlayer}
            disabled={currentPlayerIndex === 0}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{currentPlayer}</h2>
            <p className="text-white/70">
              {currentPlayerTeams.filter((t) => t.trim().length > 0).length}/
              {teamsPerPlayer} teams entered
            </p>
          </div>

          <Button
            onClick={goToNextPlayer}
            disabled={currentPlayerIndex === playerNames.length - 1}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="mx-auto">
          {/* Team Input Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-[#d4af37] text-center">
                {currentPlayer}'s Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: teamsPerPlayer }, (_, index) => {
                const teamName = currentPlayerTeams[index] || "";
                const playerTeamsList = currentPlayerTeams.filter(
                  (t) => t.trim().length > 0
                );
                const isDuplicate =
                  teamName &&
                  teamName.trim().length > 0 &&
                  playerTeamsList.filter(
                    (t) =>
                      t.toLowerCase().trim() === teamName.toLowerCase().trim()
                  ).length > 1;

                return (
                  <div key={index}>
                    <Label className="text-white mb-2 block">
                      Team {index + 1}
                    </Label>
                    <Input
                      placeholder={`Enter team ${index + 1} name`}
                      value={teamName}
                      onChange={(e) =>
                        handleTeamNameChange(index, e.target.value)
                      }
                      className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 ${
                        isDuplicate ? "border-red-400 bg-red-500/10" : ""
                      }`}
                    />
                    {isDuplicate && (
                      <p className="text-red-400 text-sm mt-1">
                        You already have this team
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Progress and Actions */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#d4af37] font-semibold mb-2">
                    Selection Progress
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {playerNames.map((name, index) => {
                      const teams = playerTeams[name] || [];
                      const playerComplete =
                        teams.length === teamsPerPlayer &&
                        teams.every((team) => team && team.trim().length > 0) &&
                        !hasPlayerDuplicates(name);

                      return (
                        <Badge
                          key={name}
                          variant={playerComplete ? "default" : "secondary"}
                          className={
                            playerComplete
                              ? "bg-[#d4af37] text-white"
                              : index === currentPlayerIndex
                              ? "bg-[#0a0f1f] text-white"
                              : hasPlayerDuplicates(name)
                              ? "bg-red-500 text-white"
                              : "bg-gray-500 text-white"
                          }
                        >
                          {name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Setup
                  </Button>
                  <Button
                    onClick={startTournament}
                    disabled={!allPlayersComplete}
                    className="bg-gradient-to-r from-[#0a0f1f] to-[#b68a2e] hover:from-[#1e3a8a] hover:to-[#b68a2e] text-white font-bold"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Tournament
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
