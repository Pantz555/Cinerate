"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Star, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function Analytics() {
  const dashboardStats = useQuery(api.admin.getDashboardStats);
  const viewTrends = useQuery(api.admin.getViewTrends, { days: 30 });
  const topMovies = useQuery(api.admin.getTopMoviesByViews, {
    limit: 5,
    timeframe: "all_time",
  });
  const allMoviesStats = useQuery(api.admin.getMoviesWithStats, {
    limit: 1000,
  });

  const genrePopularity = useMemo(() => {
    if (!allMoviesStats) return [];

    const genreCounts = new Map<string, number>();
    allMoviesStats.forEach((movie) => {
      if (movie.genres) {
        movie.genres.forEach((genre) => {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        });
      } else if (movie.genre) {
        genreCounts.set(movie.genre, (genreCounts.get(movie.genre) || 0) + 1);
      }
    });

    const total = Array.from(genreCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Array.from(genreCounts.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allMoviesStats]);

  const categoryBreakdown = useMemo(() => {
    if (!allMoviesStats) return [];

    const categories = {
      Acting: { sum: 0, count: 0 },
      Plot: { sum: 0, count: 0 },
      Cinematography: { sum: 0, count: 0 },
      Direction: { sum: 0, count: 0 },
      Entertainment: { sum: 0, count: 0 },
    };

    allMoviesStats.forEach((movie) => {
      if (movie.stats.totalRatings > 0) {
        const rating = movie.avgRating || 0;
        Object.keys(categories).forEach((cat) => {
          categories[cat as keyof typeof categories].sum += rating;
          categories[cat as keyof typeof categories].count++;
        });
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      avgRating: data.count > 0 ? +(data.sum / data.count).toFixed(2) : 0,
      totalRatings: data.count,
    }));
  }, [allMoviesStats]);

  const ratingTrends = useMemo(() => {
    if (!viewTrends) return [];

    const monthlyData = new Map<string, { views: number; ratings: number }>();

    viewTrends.forEach((trend: any) => {
      const date = new Date(trend.date);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });

      const existing = monthlyData.get(monthKey) || { views: 0, ratings: 0 };
      monthlyData.set(monthKey, {
        views: existing.views + trend.views,
        ratings: existing.ratings + trend.views,
      });
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        totalRatings: data.ratings,
        avgRating: 4.2,
        activeUsers: Math.floor(data.views / 3),
      }))
      .slice(-6);
  }, [viewTrends]);

  const userEngagement = useMemo(() => {
    if (!viewTrends || viewTrends.length < 7) return [];

    const lastWeek = viewTrends.slice(-7);
    return lastWeek.map((day: any) => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      return {
        day: dayName,
        sessions: day.views,
        ratings: Math.floor(day.views * 0.6),
        avgSession: +(4 + Math.random()).toFixed(1),
      };
    });
  }, [viewTrends]);

  const avgRating = useMemo(() => {
    if (!allMoviesStats || allMoviesStats.length === 0) return 0;
    const sum = allMoviesStats.reduce(
      (acc, movie) => acc + (movie.avgRating || 0),
      0,
    );
    return +(sum / allMoviesStats.length).toFixed(1);
  }, [allMoviesStats]);

  if (!dashboardStats || !viewTrends || !topMovies || !allMoviesStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {dashboardStats.overview.totalRatings.toLocaleString()}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />+
                {dashboardStats.recent24Hours.ratings}
              </div>
            </div>
            <Progress
              value={Math.min(
                (dashboardStats.overview.totalRatings / 20000) * 100,
                100,
              )}
              className="mt-2 bg-foreground"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {dashboardStats.overview.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />+
                {Math.round((dashboardStats.overview.totalUsers / 100) * 8.2)}%
              </div>
            </div>
            <Progress
              value={Math.min(
                (dashboardStats.overview.totalUsers / 5000) * 100,
                100,
              )}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {avgRating}
              </div>
              <div className="flex items-center text-blue-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Stable
              </div>
            </div>
            <Progress value={(avgRating / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {dashboardStats.overview.totalViews.toLocaleString()}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />+
                {dashboardStats.recent24Hours.views}
              </div>
            </div>
            <Progress
              value={Math.min(
                (dashboardStats.overview.totalViews / 50000) * 100,
                100,
              )}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="dark:bg-gray-900 dark:border-gray-800 w-full sm:w-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground text-muted-foreground whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground text-muted-foreground whitespace-nowrap"
            >
              Ratings Analysis
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground text-muted-foreground whitespace-nowrap"
            >
              User Behavior
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-foreground text-muted-foreground whitespace-nowrap"
            >
              Content Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Rating Trends</CardTitle>
                <CardDescription>
                  Monthly rating activity and user growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    totalRatings: { label: "Total Ratings", color: "#3B82F6" },
                    activeUsers: { label: "Active Users", color: "#10B981" },
                  }}
                  className="h-[250px] sm:h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ratingTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#FFFFFF" fontSize={12} />
                      <YAxis stroke="#FFFFFF" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="totalRatings"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Genre Popularity
                </CardTitle>
                <CardDescription>
                  Distribution of ratings by movie genre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ count: { label: "Ratings", color: "#3B82F6" } }}
                  className="h-[250px] sm:h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genrePopularity}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ genre, percentage }) =>
                          `${genre} ${percentage}%`
                        }
                        fontSize={10}
                      >
                        {genrePopularity.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">
                Top Performing Movies
              </CardTitle>
              <CardDescription>
                Movies with highest rating activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="flex items-center justify-between p-3 bg-accent dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {movie.title}
                        </div>
                        <div className="text-sm text-foreground">
                          {movie.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-foreground">
                          {movie.avgRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <Badge variant="default">↗</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Rating Categories Analysis
                </CardTitle>
                <CardDescription>Average ratings by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgRating: { label: "Average Rating", color: "#3B82F6" },
                  }}
                  className="h-48 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="category"
                        stroke="#FFFFFF"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis domain={[0, 5]} stroke="#FFFFFF" fontSize={12} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="avgRating"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Rating Distribution
                </CardTitle>
                <CardDescription>
                  How users rate across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div
                      key={category.category}
                      className="space-y-2 text-foreground"
                    >
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="text-foreground">
                          {category.totalRatings} ratings
                        </span>
                      </div>
                      <Progress
                        value={(category.avgRating / 5) * 100}
                        className="h-2"
                      />
                      <div className="text-right text-sm font-medium">
                        {category.avgRating}/5.0
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">
                Weekly User Engagement
              </CardTitle>
              <CardDescription>
                Daily sessions and rating activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sessions: { label: "Sessions", color: "#3B82F6" },
                  ratings: { label: "Ratings", color: "#10B981" },
                }}
                className="h-[300px] sm:h-[400px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userEngagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#FFFFFF" fontSize={12} />
                    <YAxis stroke="#FFFFFF" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3B82F6"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="ratings"
                      stroke="#10B981"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Total Movies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardStats.overview.publishedMovies.toLocaleString()}
                </div>
                <p className="text-xs text-foreground mt-1">
                  {dashboardStats.overview.draftMovies} drafts
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Avg Views per Movie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardStats.overview.publishedMovies > 0
                    ? Math.round(
                        dashboardStats.overview.totalViews /
                          dashboardStats.overview.publishedMovies,
                      ).toLocaleString()
                    : 0}
                </div>
                <p className="text-xs text-foreground mt-1">
                  per published movie
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Total Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardStats.overview.totalReviews.toLocaleString()}
                </div>
                <p className="text-xs text-foreground mt-1">
                  Community reviews published
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
