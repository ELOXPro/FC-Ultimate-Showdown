"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, RotateCcw, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Match {
  id: string;
  team1: string;
  team2: string;
  player1: string;
  player2: string;
  winner?: string;
  winnerPlayer?: string;
  team1Id: string; // Unique identifier for team1
  team2Id: string; // Unique identifier for team2
}

interface TournamentData {
  players: string[];
  playerTeams: { [key: string]: string[] };
  totalTeams: number;
}

export default function BracketPage() {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(
    null
  );
  const [currentRound, setCurrentRound] = useState(1);
  const [matches, setMatches] = useState<{ [round: number]: Match[] }>({});
  const [champion, setChampion] = useState<{
    team: string;
    player: string;
  } | null>(null);
  const [thirdPlace, setThirdPlace] = useState<{
    team: string;
    player: string;
  } | null>(null);
  const [showFinalBracket, setShowFinalBracket] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("tournamentData");
    if (data) {
      const parsed = JSON.parse(data);
      setTournamentData(parsed);
      generateInitialBracket(parsed);
    }
  }, []);

  const generateInitialBracket = (data: TournamentData) => {
    const allTeams: { team: string; player: string }[] = [];

    // Create array of all teams with their players
    Object.entries(data.playerTeams).forEach(([player, teams]) => {
      teams.forEach((team) => {
        allTeams.push({ team, player });
      });
    });

    // Shuffle teams
    const shuffledTeams = [...allTeams].sort(() => Math.random() - 0.5);

    // Ensure no same-player matchups in Round 1
    const round1Teams = ensureNoSamePlayerMatchups(shuffledTeams, data.players);

    // Generate Round 1 matches
    const round1Matches: Match[] = [];
    for (let i = 0; i < round1Teams.length; i += 2) {
      if (i + 1 < round1Teams.length) {
        round1Matches.push({
          id: `r1-m${i / 2 + 1}`,
          team1: round1Teams[i].team,
          team2: round1Teams[i + 1].team,
          player1: round1Teams[i].player,
          player2: round1Teams[i + 1].player,
          team1Id: `${round1Teams[i].team}-${round1Teams[i].player}`,
          team2Id: `${round1Teams[i + 1].team}-${round1Teams[i + 1].player}`,
        });
      }
    }

    setMatches({ 1: round1Matches });
  };

  const ensureNoSamePlayerMatchups = (
    teams: { team: string; player: string }[],
    players: string[]
  ) => {
    const result = [...teams];
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      let hasSamePlayerMatchup = false;

      for (let i = 0; i < result.length - 1; i += 2) {
        if (result[i].player === result[i + 1].player) {
          hasSamePlayerMatchup = true;
          // Find a different team to swap with
          for (let j = i + 2; j < result.length; j++) {
            if (
              result[i].player !== result[j].player &&
              result[i + 1].player !== result[j].player
            ) {
              [result[i + 1], result[j]] = [result[j], result[i + 1]];
              break;
            }
          }
          break;
        }
      }

      if (!hasSamePlayerMatchup) break;
      attempts++;
    }

    return result;
  };

  const selectWinner = (
    matchId: string,
    round: number,
    teamId: string,
    team: string,
    player: string
  ) => {
    const updatedMatches = { ...matches };
    const match = updatedMatches[round].find((m) => m.id === matchId);
    if (match) {
      match.winner = teamId;
      match.winnerPlayer = player;
    }

    setMatches(updatedMatches);

    // Check if round is complete
    const roundMatches = updatedMatches[round];
    const allMatchesComplete = roundMatches.every((m) => m.winner);

    if (allMatchesComplete) {
      if (roundMatches.length === 1) {
        // This was the final
        setChampion({
          team: match?.winner!.split("-")[0]!,
          player: match?.winnerPlayer!,
        });
      } else {
        // Generate next round
        generateNextRound(round, updatedMatches);
      }
    }
  };

  const generateNextRound = (
    completedRound: number,
    currentMatches: { [round: number]: Match[] }
  ) => {
    const winners = currentMatches[completedRound]
      .filter((m) => m.winner)
      .map((m) => ({
        team: m.winner!.split("-")[0],
        player: m.winnerPlayer!,
        teamId: m.winner!,
      }));

    if (winners.length < 2) return;

    const nextRound = completedRound + 1;
    const nextRoundMatches: Match[] = [];

    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        nextRoundMatches.push({
          id: `r${nextRound}-m${i / 2 + 1}`,
          team1: winners[i].team,
          team2: winners[i + 1].team,
          player1: winners[i].player,
          player2: winners[i + 1].player,
          team1Id: winners[i].teamId,
          team2Id: winners[i + 1].teamId,
        });
      }
    }

    const updatedMatches = { ...currentMatches, [nextRound]: nextRoundMatches };
    setMatches(updatedMatches);
    setCurrentRound(nextRound);
  };

  const getRoundName = (round: number) => {
    const roundMatches = matches[round];
    if (!roundMatches) return `Round ${round}`;

    const matchCount = roundMatches.length;
    if (matchCount === 1) return "Final";
    if (matchCount === 2) return "Semifinals";
    if (matchCount === 4) return "Quarterfinals";
    if (matchCount === 8) return "Round of 16";
    return `Round ${round}`;
  };

  const resetCurrentRound = () => {
    const updatedMatches = { ...matches };

    // Clear winners from current round
    if (updatedMatches[currentRound]) {
      updatedMatches[currentRound].forEach((match) => {
        delete match.winner;
        delete match.winnerPlayer;
      });
    }

    // Remove all rounds after current round
    const roundsToRemove = Object.keys(updatedMatches)
      .map(Number)
      .filter((round) => round > currentRound);

    roundsToRemove.forEach((round) => {
      delete updatedMatches[round];
    });

    setMatches(updatedMatches);
    setChampion(null);
    setThirdPlace(null);
    setShowFinalBracket(false); // Hide final bracket view if resetting
  };

  const resetEntireTournament = () => {
    localStorage.removeItem("tournamentData");
    router.push("/");
  };

  const goToPreviousRound = () => {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
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

  if (champion && !showFinalBracket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#1e3a8a] to-[#b68a2e] flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full mx-4">
          <CardContent className="flex gap-2 p-8 text-center">
            <Image
              className="w-1/2 h-auto"
              src="/trophy.png"
              width={200}
              height={200}
              alt="trophy"
            />
            <div className="w-1/2">
              <div className="bg-white/20 rounded-lg p-4 mb-6">
                <h2 className="text-2xl font-bold text-yellow-300">
                  {champion.player}
                </h2>
                <p className="capitalize text-white">Team: {champion.team}</p>
              </div>
              <div className="flex justify-center gap-2 flex-col">
                <Button
                  onClick={() => setShowFinalBracket(true)} // View Results button
                  className="w-full bg-[#1e3a8a] hover:bg-[#0a0f1f]"
                >
                  View Final Bracket
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

  return (
    <div className="min-h-screen bg-[#0a0f1f]">
      <div className="max-w-6xl container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-[#b68a2e] flex items-center gap-2">
              Tournament Bracket
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={goToPreviousRound}
              variant="outline"
              className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
              disabled={currentRound === 1}
            >
              Previous Stage
            </Button>
            <Button
              onClick={resetCurrentRound}
              variant="outline"
              className="border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Round
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

        {/* Current Round */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#f6cf6e] mb-6 text-center">
            {getRoundName(currentRound)}
          </h2>

          <div className="grid gap-4 mx-auto">
            {matches[currentRound]?.map((match) => (
              <Card
                key={match.id}
                className="bg-white/10 backdrop-blur-md border-white/20"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Team 1 */}
                    <Button
                      variant={
                        match.winner === match.team1Id ? "default" : "outline"
                      }
                      className={`text-xl capitalize h-auto p-4 ${
                        match.winner === match.team1Id
                          ? "bg-[#b68a2e] hover:bg-[#f6cf6e]"
                          : "border-white/30 text-[#b68a2e] hover:bg-white/10"
                      }`}
                      onClick={() =>
                        !match.winner &&
                        selectWinner(
                          match.id,
                          currentRound,
                          match.team1Id,
                          match.team1,
                          match.player1
                        )
                      }
                      disabled={!!match.winner}
                    >
                      <div className="text-center">
                        <div className="font-bold">{match.team1}</div>
                        <Badge variant="secondary" className="mt-1 [#0a0f1f]">
                          {match.player1}
                        </Badge>
                      </div>
                    </Button>

                    {/* VS */}
                    <div className="text-center">
                      <span className="text-white font-bold text-xl">VS</span>
                    </div>

                    {/* Team 2 */}
                    <Button
                      variant={
                        match.winner === match.team2Id ? "default" : "outline"
                      }
                      className={`text-xl capitalize h-auto p-4 ${
                        match.winner === match.team2Id
                          ? "bg-[#b68a2e] hover:bg-[#f6cf6e]"
                          : "border-white/30 text-[#b68a2e] hover:bg-white/10"
                      }`}
                      onClick={() =>
                        !match.winner &&
                        selectWinner(
                          match.id,
                          currentRound,
                          match.team2Id,
                          match.team2,
                          match.player2
                        )
                      }
                      disabled={!!match.winner}
                    >
                      <div className="text-center">
                        <div className="font-bold">{match.team2}</div>
                        <Badge variant="secondary" className="mt-1">
                          {match.player2}
                        </Badge>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Player Stats */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mx-auto">
          <CardHeader>
            <CardTitle className="text-[#f6cf6e]">Player Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tournamentData.players.map((player) => {
                const teamsRemaining = Object.values(matches)
                  .flat()
                  .filter((m) => m.winner && m.winnerPlayer === player).length;
                const totalTeams = tournamentData.playerTeams[player].length;

                return (
                  <div key={player} className="text-center">
                    <div className="text-white font-semibold">{player}</div>
                    <div className="text-white/70 text-sm">
                      {teamsRemaining} wins
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
