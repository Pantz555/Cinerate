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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  Settings,
  Star,
  Heart,
  Eye,
  Clock,
  Zap,
  Bell,
  Palette,
  BarChart3,
  Loader2,
  RefreshCw,
  ArrowLeft
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

  // Mock user data (you can fetch this from your user query)
  const mockUser = {
    favoriteGenres: ["Action", "Sci-Fi", "Thriller"],
    preferredRatingRange: [3.5, 5.0] as [number, number],
    personalityProfile: {
      adventurous: 0.7,
      critical: 0.3,
      social: 0.8,
      binge: 0.6,
    },
    stats: {
      watchedMovies: 45,
      ratedMovies: 32,
      avgRating: 4.7,
    },
  };

  const [preferences, setPreferences] = useState(mockUser);
  const [uiSettings, setUISettings] = useState({
    compactMode: false,
    showRatings: true,
    autoplay: false,
    notifications: {
      newReleases: true,
      recommendations: true,
      communityActivity: false,
      weeklyDigest: true,
    },
  });

  const personalityTraits = [
    {
      name: "Adventurous",
      value: preferences.personalityProfile.adventurous,
      description: "Willingness to explore new genres",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: "Critical",
      value: preferences.personalityProfile.critical,
      description: "Tendency to rate movies harshly",
      icon: <Target className="w-4 h-4" />,
    },
    {
      name: "Social",
      value: preferences.personalityProfile.social,
      description: "Engagement with community features",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      name: "Binge Watcher",
      value: preferences.personalityProfile.binge,
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

  const updateRatingRange = (newRange: number[]) => {
    setPreferences((prev) => ({
      ...prev,
      preferredRatingRange: [newRange[0], newRange[1]] as [number, number],
    }));
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
    <div className="min-h-screen bg-black text-white p-4 pb-20">
         <Button variant="ghost" className="text-gray-300 mb-6" asChild>
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
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your AI-powered movie discovery engine learns from your preferences
            to deliver perfect recommendations
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800 grid grid-cols-1 md:grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="interface"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <Palette className="w-4 h-4 mr-2" />
              Interface
            </TabsTrigger>
          </TabsList>

          {/* AI Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
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
                    <Brain className="w-16 h-16 text-gray-600" />
                    <p className="text-gray-400">Loading recommendations...</p>
                    <Button
                      onClick={handleRefreshRecommendations}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Generate Recommendations
                    </Button>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Target className="w-16 h-16 text-gray-600" />
                    <p className="text-gray-400">
                      No recommendations yet. Rate some movies to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((movie: any) => (
                      <div
                        key={movie._id}
                        className="bg-gray-800 rounded-lg p-4 space-y-3"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white truncate">
                            {movie.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-300">
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
                              className="text-xs text-gray-300 border-gray-600"
                            >
                              {getAlgorithmLabel(movie.recommendationAlgorithm)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            •{" "}
                            {movie.recommendationReason ||
                              "Recommended for you"}
                          </p>
                          {movie.genres && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {movie.genres.slice(0, 2).map((genre: string) => (
                                <span
                                  key={genre}
                                  className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
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
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Community</p>
                      <p className="text-sm text-gray-400">
                        Similar users loved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Discovery</p>
                      <p className="text-sm text-gray-400">Expand your taste</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personality Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Your Movie Personality
                </CardTitle>
                <CardDescription>
                  AI analysis of your viewing patterns and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personalityTraits.map((trait) => (
                    <div key={trait.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          {trait.icon}
                          <span className="font-medium text-white">
                            {trait.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {Math.round(trait.value * 100)}%
                        </span>
                      </div>
                      <Progress value={trait.value * 100} className="h-2" />
                      <p className="text-sm text-gray-400">
                        {trait.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Viewing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {preferences.stats.watchedMovies}
                      </p>
                      <p className="text-sm text-gray-400">Movies Watched</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {preferences.stats.ratedMovies}
                      </p>
                      <p className="text-sm text-gray-400">Movies Rated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {preferences.stats.avgRating}
                      </p>
                      <p className="text-sm text-gray-400">Avg Rating Given</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Genres */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Favorite Genres</CardTitle>
                <CardDescription>Based on your rating history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {preferences.favoriteGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-blue-600 text-white"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Rating Preferences</CardTitle>
                <CardDescription>
                  Customize your movie discovery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block text-white">
                    Preferred Rating Range:{" "}
                    {preferences.preferredRatingRange[0]} -{" "}
                    {preferences.preferredRatingRange[1]}
                  </label>
                  <Slider
                    value={preferences.preferredRatingRange}
                    onValueChange={updateRatingRange}
                    max={5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1.0</span>
                    <span>5.0</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white">
                    Recommendation Settings
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Include Popular Movies
                      </p>
                      <p className="text-sm text-gray-400">
                        Show trending and popular films
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Discovery Mode</p>
                      <p className="text-sm text-gray-400">
                        Include movies outside your usual taste
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Hide Watched Movies
                      </p>
                      <p className="text-sm text-gray-400">
                        Don't show movies you've already seen
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Choose what updates you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">New Releases</p>
                    <p className="text-sm text-gray-400">
                      Movies matching your taste
                    </p>
                  </div>
                  <Switch
                    checked={uiSettings.notifications.newReleases}
                    onCheckedChange={(checked) =>
                      setUISettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          newReleases: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      Personalized Recommendations
                    </p>
                    <p className="text-sm text-gray-400">
                      Weekly curated suggestions
                    </p>
                  </div>
                  <Switch
                    checked={uiSettings.notifications.recommendations}
                    onCheckedChange={(checked) =>
                      setUISettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          recommendations: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Community Activity</p>
                    <p className="text-sm text-gray-400">
                      Reviews and discussions
                    </p>
                  </div>
                  <Switch
                    checked={uiSettings.notifications.communityActivity}
                    onCheckedChange={(checked) =>
                      setUISettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          communityActivity: checked,
                        },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interface Customization */}
          <TabsContent value="interface" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Interface Preferences
                </CardTitle>
                <CardDescription>
                  Customize your viewing experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Compact Mode</p>
                      <p className="text-sm text-gray-400">
                        Show more content in less space
                      </p>
                    </div>
                    <Switch
                      checked={uiSettings.compactMode}
                      onCheckedChange={(checked) =>
                        setUISettings((prev) => ({
                          ...prev,
                          compactMode: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Show Ratings</p>
                      <p className="text-sm text-gray-400">
                        Display ratings on movie cards
                      </p>
                    </div>
                    <Switch
                      checked={uiSettings.showRatings}
                      onCheckedChange={(checked) =>
                        setUISettings((prev) => ({
                          ...prev,
                          showRatings: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Auto-play Trailers
                      </p>
                      <p className="text-sm text-gray-400">
                        Play trailers when hovering
                      </p>
                    </div>
                    <Switch
                      checked={uiSettings.autoplay}
                      onCheckedChange={(checked) =>
                        setUISettings((prev) => ({
                          ...prev,
                          autoplay: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription>
                  Manage your personalization data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 hover:bg-gray-800 bg-transparent text-white hover:text-white"
                >
                  Export My Data
                </Button>
                <Button
                  onClick={handleRefreshRecommendations}
                  variant="outline"
                  className="w-full border-gray-600 hover:bg-gray-800 hover:text-white bg-transparent text-white"
                >
                  Reset Recommendations
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent hover:text-red-300"
                >
                  Clear All Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
