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
  TrendingUp,
  Settings,
  Star,
  Heart,
  Eye,
  Clock,
  Zap,
  Bell,
  Palette,
  Grid,
  BarChart3,
} from "lucide-react";

// Mock user data for demonstration
const mockUserPreferences = {
  favoriteGenres: ["Action", "Sci-Fi", "Thriller"],
  preferredRatingRange: [3.5, 5.0] as [number, number],
  watchedMovies: ["inception", "dark-knight", "interstellar"],
  ratedMovies: [
    {
      movieId: "inception",
      rating: 5,
      categories: {
        acting: 5,
        plot: 5,
        cinematography: 5,
        direction: 5,
        entertainment: 5,
      },
    },
    {
      movieId: "dark-knight",
      rating: 5,
      categories: {
        acting: 5,
        plot: 4,
        cinematography: 5,
        direction: 5,
        entertainment: 5,
      },
    },
  ],
  personalityProfile: {
    adventurous: 0.7,
    critical: 0.3,
    social: 0.8,
    binge: 0.6,
  },
};

const mockRecommendations = [
  {
    movieId: "dune",
    title: "Dune",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 4.6,
    confidence: 0.92,
    reasons: ["Matches your Sci-Fi preferences", "From acclaimed director"],
    matchScore: 92,
    category: "similar" as const,
  },
  {
    movieId: "blade-runner-2049",
    title: "Blade Runner 2049",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 4.5,
    confidence: 0.89,
    reasons: ["Similar to movies you loved", "Highly rated"],
    matchScore: 89,
    category: "collaborative" as const,
  },
  {
    movieId: "everything-everywhere",
    title: "Everything Everywhere All at Once",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 4.8,
    confidence: 0.85,
    reasons: ["Trending now", "Matches your adventurous taste"],
    matchScore: 85,
    category: "trending" as const,
  },
];

export default function PersonalizationPage() {
  const [preferences, setPreferences] = useState(mockUserPreferences);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [uiSettings, setUISettings] = useState({
    theme: "dark",
    compactMode: false,
    showRatings: true,
    autoplay: false,
    gridSize: "medium",
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

  const updateRatingRange = (newRange: number[]) => {
    setPreferences((prev) => ({
      ...prev,
      preferredRatingRange: [newRange[0], newRange[1]] as [number, number],
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
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
          <TabsList className="bg-gray-900 border-gray-800 grid grid-cols-4 w-full max-w-2xl mx-auto">
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized movie suggestions based on your viewing history
                  and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.movieId}
                      className="bg-gray-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
                        <img
                          src={rec.poster || "/placeholder.svg"}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white truncate">
                          {rec.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-300">
                              {rec.rating}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              rec.category === "similar"
                                ? "bg-blue-600"
                                : rec.category === "trending"
                                  ? "bg-red-600"
                                  : rec.category === "collaborative"
                                    ? "bg-green-600"
                                    : "bg-purple-600"
                            }`}
                          >
                            {rec.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {rec.reasons.map((reason, index) => (
                            <p key={index} className="text-xs text-gray-400">
                              • {reason}
                            </p>
                          ))}
                        </div>
                        <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                          <Star className="w-4 h-4 mr-2" />
                          Rate Movie
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Similar Movies</p>
                      <p className="text-sm text-gray-400">
                        Based on your ratings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Trending</p>
                      <p className="text-sm text-gray-400">
                        Popular with your taste
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

              <Card className="bg-gray-900 border-gray-800">
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
                        {preferences.watchedMovies.length}
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
                        {preferences.ratedMovies.length}
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
                      <p className="text-2xl font-bold text-white">4.7</p>
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
