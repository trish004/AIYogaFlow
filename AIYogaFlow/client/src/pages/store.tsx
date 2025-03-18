import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ShoppingBag, Star } from "lucide-react";
import type { Product, LessonGroup, Instructor } from "@shared/schema";

// Helper function to format price in Rupees
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}

export default function Store() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: lessonGroups } = useQuery<(LessonGroup & { instructor: Instructor })[]>({
    queryKey: ["/api/lesson-groups"],
  });

  // Group lessons by price type
  const freeLessons = lessonGroups?.filter(group => group.priceType === "free") || [];
  const paidLessons = lessonGroups?.filter(group => group.priceType === "paid") || [];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Yoga Store</h1>

        <Tabs defaultValue="lessons">
          <TabsList className="mb-6">
            <TabsTrigger value="lessons">Yoga Lessons</TabsTrigger>
            <TabsTrigger value="products">Equipment & Accessories</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Free Lessons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeLessons.map((group) => (
                  <Card key={group.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{group.name}</CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Free
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="aspect-video rounded-md overflow-hidden mb-4">
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground">{group.description}</p>
                        <div className="flex items-center gap-2">
                          <img
                            src={group.instructor.imageUrl}
                            alt={group.instructor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{group.instructor.name}</p>
                            <p className="text-xs text-muted-foreground">{group.instructor.specialty}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{group.level}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">4.8 (120 reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Premium Lessons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidLessons.map((group) => (
                  <Card key={group.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{group.name}</CardTitle>
                        <Badge variant="default" className="bg-primary/10 text-primary">
                          Premium
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="aspect-video rounded-md overflow-hidden mb-4">
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground">{group.description}</p>
                        <div className="flex items-center gap-2">
                          <img
                            src={group.instructor.imageUrl}
                            alt={group.instructor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{group.instructor.name}</p>
                            <p className="text-xs text-muted-foreground">{group.instructor.specialty}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">4.8 (120 reviews)</span>
                          </div>
                          <p className="text-lg font-semibold">{formatPrice(Number(group.price))}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Enroll Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="aspect-square rounded-md overflow-hidden mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-muted-foreground mb-2">{product.description}</p>
                    <p className="text-lg font-semibold">{formatPrice(Number(product.price))}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}