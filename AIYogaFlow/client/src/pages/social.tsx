import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Medal, Target, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Challenge, User, ChallengeParticipant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Social() {
  const { toast } = useToast();
  const userId = 1; // TODO: Get from auth context

  const { data: currentChallenge } = useQuery<Challenge>({
    queryKey: ["/api/challenges/current"],
  });

  const { data: leaderboard } = useQuery<(User & { totalScore: number })[]>({
    queryKey: ["/api/leaderboard/global"],
  });

  const { data: challengeLeaderboard, refetch: refetchChallengeLeaderboard } = useQuery<(ChallengeParticipant & { user: User })[]>({
    queryKey: ["/api/challenges", currentChallenge?.id, "leaderboard"],
    enabled: !!currentChallenge,
  });

  const userProgress = challengeLeaderboard?.find(entry => entry.userId === userId)?.currentScore || 0;
  const progressPercentage = currentChallenge ? (userProgress / currentChallenge.targetScore) * 100 : 0;

  async function handleJoinChallenge() {
    if (!currentChallenge) return;

    try {
      await apiRequest("POST", `/api/challenges/${currentChallenge.id}/join`, {
        userId,
      });

      await refetchChallengeLeaderboard();
      queryClient.invalidateQueries({ queryKey: ["/api/challenges", currentChallenge.id, "leaderboard"] });

      toast({
        title: "Joined Challenge",
        description: "You've successfully joined the challenge! Start practicing to earn points.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the challenge.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community & Challenges</h1>
          <p className="text-muted-foreground">
            Join challenges and compete with other yogis
          </p>
        </div>

        {currentChallenge && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Challenge</CardTitle>
                <Badge variant="secondary" className="flex gap-1 items-center">
                  <Target className="w-4 h-4" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{currentChallenge.title}</h3>
                  <p className="text-muted-foreground">{currentChallenge.description}</p>
                </div>

                {userProgress > 0 && (
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Your Progress</span>
                      <span>{userProgress} / {currentChallenge.targetScore} points</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    {progressPercentage >= 100 && (
                      <div className="flex items-center gap-2 mt-2 text-primary">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Challenge Completed!</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Rewards</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Medal className="w-4 h-4" />
                        Special Badge
                      </Badge>
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Star className="w-4 h-4" />
                        500 XP
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={handleJoinChallenge}>Join Challenge</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Global Leaderboard</CardTitle>
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Users className="w-4 h-4" />
                  {leaderboard?.length || 0} Users
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-accent/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 ? (
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <span className="text-lg font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <Avatar />
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.totalScore} points
                        </div>
                      </div>
                    </div>
                    {index === 0 && <Badge>Leader</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {currentChallenge && challengeLeaderboard && challengeLeaderboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Challenge Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challengeLeaderboard.map((entry, index) => (
                    entry.user && (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-accent/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {index === 0 ? (
                              <Trophy className="w-6 h-6 text-yellow-500" />
                            ) : (
                              <span className="text-lg font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <Avatar />
                          <div>
                            <div className="font-medium">{entry.user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.currentScore} points
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}