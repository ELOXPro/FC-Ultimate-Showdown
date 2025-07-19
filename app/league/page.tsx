"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Crown, Table } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Match {
  id: string;
  team1: string;
  team2: string;
  player1: string;
  player2: string;
  result?: "team1" | "team2" | "draw";
  played: boolean;
}

interface TeamStats {
  id: string;
  team: string;
  player: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

interface TournamentData {
  players: string[];
  playerTeams: { [key: string]: string[] };
  totalTeams: number;
  format: string;
}

export default function LeaguePage() {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(
    null
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("tournamentData");
    const progress = localStorage.getItem("leagueProgress");
    if (progress) {
      const parsed = JSON.parse(progress);
      setTournamentData(parsed.tournamentData);
      setMatches(parsed.matches);
      setCurrentMatchIndex(parsed.currentMatchIndex);
      setLeagueTable(parsed.leagueTable);
      setIsComplete(parsed.isComplete);
    } else if (data) {
      const parsed = JSON.parse(data);
      setTournamentData(parsed);
      generateLeagueMatches(parsed);
    }
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (tournamentData) {
      localStorage.setItem(
        "leagueProgress",
        JSON.stringify({
          tournamentData,
          matches,
          currentMatchIndex,
          leagueTable,
          isComplete,
        })
      );
    }
  }, [tournamentData, matches, currentMatchIndex, leagueTable, isComplete]);

  const generateLeagueMatches = (data: TournamentData) => {
    const allTeams: { team: string; player: string }[] = [];

    // Create array of all teams with their players
    Object.entries(data.playerTeams).forEach(([player, teams]) => {
      teams.forEach((team) => {
        if (team.trim().length > 0) {
          allTeams.push({ team: team.trim(), player: player.trim() });
        }
      });
    });

    // Generate all possible matches (round-robin)
    const generatedMatches: Match[] = [];
    for (let i = 0; i < allTeams.length; i++) {
      for (let j = i + 1; j < allTeams.length; j++) {
        generatedMatches.push({
          id: `match-${i}-${j}`,
          team1: allTeams[i].team,
          team2: allTeams[j].team,
          player1: allTeams[i].player,
          player2: allTeams[j].player,
          played: false,
        });
      }
    }

    // Shuffle matches for variety
    const shuffledMatches = generatedMatches.sort(() => Math.random() - 0.5);
    setMatches(shuffledMatches);

    // Initialize league table with unique IDs for each team-player combo
    const initialTable: TeamStats[] = allTeams.map(({ team, player }) => ({
      id: `${team.toLowerCase()}-${player.toLowerCase()}`, // Unique ID
      team,
      player,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
    }));
    setLeagueTable(initialTable);
  };

  // Helper to find team stats by unique ID
  const findTeamStats = (
    table: TeamStats[],
    teamName: string,
    playerName: string
  ) => {
    const idToFind = `${teamName.toLowerCase()}-${playerName.toLowerCase()}`;
    return table.find((t) => t.id === idToFind);
  };

  const reverseMatchResult = (match: Match, currentTable: TeamStats[]) => {
    if (!match.result) return currentTable;

    const newTable = currentTable.map((stats) => {
      if (
        stats.id ===
        `${match.team1.toLowerCase()}-${match.player1.toLowerCase()}`
      ) {
        const newStats = { ...stats, played: stats.played - 1 };
        if (match.result === "team1") {
          newStats.wins--;
          newStats.points -= 3;
        } else if (match.result === "draw") {
          newStats.draws--;
          newStats.points -= 1;
        }
        return newStats;
      } else if (
        stats.id ===
        `${match.team2.toLowerCase()}-${match.player2.toLowerCase()}`
      ) {
        const newStats = { ...stats, played: stats.played - 1 };
        if (match.result === "team2") {
          newStats.wins--;
          newStats.points -= 3;
        } else if (match.result === "draw") {
          newStats.draws--;
          newStats.points -= 1;
        }
        return newStats;
      } else {
        return stats;
      }
    });

    // Handle losses separately as they are on the *other* team
    const finalTable = newTable.map((stats) => {
      if (
        match.result === "team1" &&
        stats.id ===
          `${match.team2.toLowerCase()}-${match.player2.toLowerCase()}`
      ) {
        return { ...stats, losses: stats.losses - 1 };
      } else if (
        match.result === "team2" &&
        stats.id ===
          `${match.team1.toLowerCase()}-${match.player1.toLowerCase()}`
      ) {
        return { ...stats, losses: stats.losses - 1 };
      } else {
        return stats;
      }
    });

    return finalTable;
  };

  const applyMatchResult = (
    match: Match,
    result: "team1" | "team2" | "draw",
    currentTable: TeamStats[]
  ) => {
    const newTable = currentTable.map((stats) => {
      if (
        stats.id ===
        `${match.team1.toLowerCase()}-${match.player1.toLowerCase()}`
      ) {
        const newStats = { ...stats, played: stats.played + 1 };
        if (result === "team1") {
          newStats.wins++;
          newStats.points += 3;
        } else if (result === "draw") {
          newStats.draws++;
          newStats.points += 1;
        }
        return newStats;
      } else if (
        stats.id ===
        `${match.team2.toLowerCase()}-${match.player2.toLowerCase()}`
      ) {
        const newStats = { ...stats, played: stats.played + 1 };
        if (result === "team2") {
          newStats.wins++;
          newStats.points += 3;
        } else if (result === "draw") {
          newStats.draws++;
          newStats.points += 1;
        }
        return newStats;
      } else {
        return stats;
      }
    });

    // Handle losses separately as they are on the *other* team
    const finalTable = newTable.map((stats) => {
      if (
        result === "team1" &&
        stats.id ===
          `${match.team2.toLowerCase()}-${match.player2.toLowerCase()}`
      ) {
        return { ...stats, losses: stats.losses + 1 };
      } else if (
        result === "team2" &&
        stats.id ===
          `${match.team1.toLowerCase()}-${match.player1.toLowerCase()}`
      ) {
        return { ...stats, losses: stats.losses + 1 };
      } else {
        return stats;
      }
    });

    return finalTable;
  };

  const recordMatchResult = (result: "team1" | "team2" | "draw") => {
    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch) return;

    let updatedTable = [...leagueTable];

    // If match was already played, first reverse its previous result
    if (currentMatch.played && currentMatch.result) {
      updatedTable = reverseMatchResult(currentMatch, updatedTable);
    }

    // Update match state
    const updatedMatches = [...matches];
    updatedMatches[currentMatchIndex] = {
      ...currentMatch,
      result,
      played: true,
    };
    setMatches(updatedMatches);

    // Apply new result to league table
    updatedTable = applyMatchResult(
      updatedMatches[currentMatchIndex],
      result,
      updatedTable
    );

    // Sort table by points (then by wins as tiebreaker)
    updatedTable.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });
    setLeagueTable(updatedTable);

    // Move to next match or complete tournament
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const resetCurrentMatch = () => {
    if (currentMatchIndex > 0) {
      const previousMatchIndex = currentMatchIndex - 1;
      const matchToReset = matches[previousMatchIndex];

      if (matchToReset.played && matchToReset.result) {
        // Reverse the match result from league table
        const updatedTable = reverseMatchResult(matchToReset, [...leagueTable]);

        // Sort table again
        updatedTable.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.wins - a.wins;
        });
        setLeagueTable(updatedTable);

        // Reset the match to unplayed state
        const updatedMatches = [...matches];
        updatedMatches[previousMatchIndex] = {
          ...matchToReset,
          played: false,
          result: undefined,
        };
        setMatches(updatedMatches);
      }

      setCurrentMatchIndex(previousMatchIndex);
      setIsComplete(false);
    }
  };

  const resetEntireTournament = () => {
    localStorage.removeItem("tournamentData");
    localStorage.removeItem("leagueProgress");
    router.push("/");
  };

  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#1e3a8a] to-[#b68a2e] flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white mb-4">No tournament data found.</p>
            <Link href="/">
              <Button className="bg-[#b68a2e]">Start New Tournament</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    // Aggregate points by player
    const playerPoints: {
      [player: string]: { total: number; teams: TeamStats[] };
    } = {};
    leagueTable.forEach((team) => {
      if (!playerPoints[team.player]) {
        playerPoints[team.player] = { total: 0, teams: [] };
      }
      playerPoints[team.player].total += team.points;
      playerPoints[team.player].teams.push(team);
    });
    // Find the player with the highest total points
    const winnerPlayer = Object.entries(playerPoints).sort(
      (a, b) => b[1].total - a[1].total
    )[0];
    const winnerName = winnerPlayer[0];
    const winnerTotalPoints = winnerPlayer[1].total;
    // Find their best team (highest points, then most wins)
    const bestTeam = winnerPlayer[1].teams.sort(
      (a, b) => b.points - a.points || b.wins - a.wins
    )[0];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#1e3a8a] to-[#b68a2e] flex items-center justify-center px-2 sm:px-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full mx-2 sm:mx-4">
          <CardContent className="flex flex-col sm:flex-row gap-4 sm:gap-8 p-4 sm:p-8 text-center items-center justify-center">
            <Image className="w-24 h-24 sm:w-1/2 sm:h-auto mx-auto" src="/trophy.png" width={200} height={200} alt="trophy" />
            <div className="w-full sm:w-1/2">
              <div className="bg-white/20 rounded-lg p-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300">
                  {winnerName}
                </h2>
                <p className="capitalize text-white text-base sm:text-lg">Best team: {bestTeam.team}</p>
                <p className="text-xs sm:text-sm text-white/80">
                  {winnerTotalPoints} total points • Best team: {bestTeam.points} pts, {bestTeam.wins}W {bestTeam.draws}D {bestTeam.losses}L
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={() => setIsComplete(false)}
                  className="w-full bg-[#1e3a8a] hover:bg-[#0a0f1f]"
                >
                  View Final Standings
                </Button>
                <Button
                  onClick={resetEntireTournament}
                  className="w-full bg-[#b68a2e] hover:hover:bg-[#0a0f1f]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start New Tournament
                </Button>
                <Link href="/rules">
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    View Rules
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  return (
    <div className="min-h-screen bg-[#0a0f1f]">
      <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#b68a2e] flex items-center gap-2">
              League Tournament
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={resetCurrentMatch}
              disabled={currentMatchIndex === 0}
              variant="outline"
              className="border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Edit Previous Match
            </Button>
            <Button
              onClick={resetEntireTournament}
              variant="outline"
              className="border-red-400/50 text-red-300 hover:bg-red-500/20 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Tournament
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Match */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
              Match {currentMatchIndex + 1} of {matches.length}
            </h2>

            {currentMatch && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Teams */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center mb-4 sm:mb-6">
                      <div className="text-center">
                        <div className="capitalize font-bold text-white text-base sm:text-lg">
                          {currentMatch.team1}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {currentMatch.player1}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <span className="text-[#f6cf6e] font-bold text-lg sm:text-xl">
                          VS
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="capitalize font-bold text-white text-base sm:text-lg">
                          {currentMatch.team2}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {currentMatch.player2}
                        </Badge>
                      </div>
                    </div>

                    {/* Result Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <Button
                        onClick={() => recordMatchResult("team1")}
                        className="bg-[#b68a2e] hover:bg-[#f6cf6e] text-white w-full"
                      >
                        {currentMatch.team1} Wins
                      </Button>
                      <Button
                        onClick={() => recordMatchResult("draw")}
                        className="bg-[#0a0f1f] hover:bg-[#0a0f1f]/50 text-white w-full"
                      >
                        Draw
                      </Button>
                      <Button
                        onClick={() => recordMatchResult("team2")}
                        className="bg-[#b68a2e] hover:bg-[#f6cf6e] text-white w-full"
                      >
                        {currentMatch.team2} Wins
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* League Table */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
              League Table
            </h2>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  {leagueTable.map((team, index) => (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                        index === 0
                          ? "bg-yellow-500/20 border border-yellow-500/30"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="w-full flex items-center gap-2 sm:gap-3">
                        <span className="text-white font-bold w-6">
                          {index + 1}
                        </span>
                        <div>
                          <div className="capitalize text-white font-medium text-sm sm:text-base">
                            {team.team}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {team.player}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <div className="text-white font-bold text-sm sm:text-base">
                          {team.points} pts
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">
                          {team.wins}W {team.draws}D {team.losses}L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
