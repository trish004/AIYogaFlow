import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Session, Achievement } from "@shared/schema";

export default function Profile() {
  const userId = 1; // TODO: Get from auth context

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["/api/users", userId, "sessions"],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/users", userId, "achievements"],
  });

  const totalScore = sessions?.reduce((sum, session) => sum + session.score, 0) || 0;
  const averageScore = sessions?.length ? totalScore / sessions.length : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Total Sessions</dt>
                  <dd className="text-2xl font-bold">{sessions?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Average Score</dt>
                  <dd>
                    <Progress value={averageScore} className="mt-2" />
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-2 rounded-lg bg-accent/10"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      🏆
                    </div>
                    <div>
                      <div className="font-medium">{achievement.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/10"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {session.duration}s
                    </div>
                  </div>
                  <Progress value={session.score} className="w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
