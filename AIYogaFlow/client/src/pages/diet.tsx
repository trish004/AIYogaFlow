import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DietPlan } from "@shared/schema";

export default function Diet() {
  const { data: dietPlans } = useQuery<DietPlan[]>({
    queryKey: ["/api/diet-plans"],
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Yoga Diet Plans</h1>

        <div className="grid gap-6">
          {dietPlans?.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge>{plan.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Daily Calories: {plan.calories}</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <p className="text-muted-foreground">{plan.recommendations}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
