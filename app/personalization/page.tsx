"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  Star,
  Heart,
  Eye,
  Clock,
  Zap,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function PersonalizationPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user recommendations
  const recommendations = useQuery(api.recommendations.getUserRecommendations, {
    limit: 20,
  });

  // Generate new recommendations
  const generateRecs = useMutation(api.recommendations.generateRecommendations);

  // Fetch user stats (includes personality and favorite genres)
  const userStats = useQuery(api.profile.getUserStats, {});

  const personalityTraits = [
    {
      name: "Adventurous",
      value: userStats?.personalityProfile?.adventurous || 0,
      description: "Willingness to explore new genres",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: "Critical",
      value: userStats?.personalityProfile?.critical || 0,
      description: "Tendency to rate movies harshly",
      icon: <Target className="w-4 h-4" />,
    },
    {
      name: "Social",
      value: userStats?.personalityProfile?.social || 0,
      description: "Engagement with community features",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      name: "Binge Watcher",
      value: userStats?.personalityProfile?.binge || 0,
      description: "Tendency to watch multiple movies",
      icon: <Eye className="w-4 h-4" />,
    },
  ];

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    try {
      await generateRecs({ limit: 20, refreshCache: true });
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case "content_based":
        return "bg-blue-600";
      case "collaborative":
        return "bg-green-600";
      case "trending":
        return "bg-red-600";
      case "discovery":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getAlgorithmLabel = (algorithm: string) => {
    switch (algorithm) {
      case "content_based":
        return "Similar";
      case "collaborative":
        return "Community";
      case "trending":
        return "Trending";
      case "discovery":
        return "Discovery";
      default:
        return "Recommended";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <Button variant="ghost" className="text-muted-foreground mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Personalization Hub</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered movie discovery engine learns from your preferences
            to deliver perfect recommendations
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="dark:bg-gray-900 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 w-full max-w-2xl mx-auto">
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground"
            >
              <Target className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground"
            >
              <Brain className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* AI Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      AI-Powered Recommendations
                    </CardTitle>
                    <CardDescription>
                      Personalized movie suggestions based on your viewing
                      history and preferences
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleRefreshRecommendations}
                    disabled={isRefreshing || !recommendations}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!recommendations ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Brain className="w-16 h-16 text-foreground" />
                    <p className="text-muted-foreground">
                      Loading recommendations...
                    </p>
                    <Button
                      onClick={handleRefreshRecommendations}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Generate Recommendations
                    </Button>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Target className="w-16 h-16 text-foreground" />
                    <p className="text-muted-foreground">
                      No recommendations yet. Rate some movies to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((movie: any) => (
                      <div
                        key={movie._id}
                        className="bg-card dark:bg-gray-800 rounded-lg p-4 space-y-3"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card/90 dark:bg-gray-700">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-muted-foreground">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground truncate">
                            {movie.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">
                                {movie.avgRating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getAlgorithmColor(
                                movie.recommendationAlgorithm,
                              )}`}
                            >
                              {Math.round(
                                (movie.recommendationScore || 0) * 100,
                              )}
                              % Match
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground border-border dark:border-gray-600"
                            >
                              {getAlgorithmLabel(movie.recommendationAlgorithm)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            •{" "}
                            {movie.recommendationReason ||
                              "Recommended for you"}
                          </p>
                          {movie.genres && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {movie.genres.slice(0, 2).map((genre: string) => (
                                <span
                                  key={genre}
                                  className="text-xs text-muted-foreground bg-card/90 dark:bg-gray-700 px-2 py-1 rounded"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-foreground">
                            <Link
                              className="w-full flex items-center justify-center gap-2"
                              href={`/movie/${movie._id}`}
                            >
                              <Star className="w-4 h-4 " />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendation Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Community</p>
                      <p className="text-sm text-muted-foreground">
                        Similar users loved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card dark:bg-gray-800 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Discovery</p>
                      <p className="text-sm text-muted-foreground">
                        Expand your taste
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personality Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Your Movie Personality
                </CardTitle>
                <CardDescription>
                  AI analysis of your viewing patterns and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!userStats ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personalityTraits.map((trait) => (
                      <div key={trait.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-foreground">
                            {trait.icon}
                            <span className="font-medium text-foreground">
                              {trait.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(trait.value * 100)}%
                          </span>
                        </div>
                        <Progress value={trait.value * 100} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {trait.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Viewing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {userStats?.viewCount || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Movies Watched
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {userStats?.totalRatings || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Movies Rated
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {userStats?.avgRating || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Rating Given
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Genres */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Favorite Genres
                </CardTitle>
                <CardDescription>Based on your rating history</CardDescription>
              </CardHeader>
              <CardContent>
                {!userStats?.favoriteGenres ||
                userStats.favoriteGenres.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Rate more movies to discover your favorite genres
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userStats.favoriteGenres.map((genre: string) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="bg-blue-600 text-white"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
