"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TrendingUp, TrendingDown, Star, Download } from "lucide-react";

// Mock analytics data
const ratingTrends = [
  { month: "Jan", totalRatings: 1200, avgRating: 4.2, activeUsers: 450 },
  { month: "Feb", totalRatings: 1450, avgRating: 4.1, activeUsers: 520 },
  { month: "Mar", totalRatings: 1680, avgRating: 4.3, activeUsers: 580 },
  { month: "Apr", totalRatings: 1920, avgRating: 4.2, activeUsers: 640 },
  { month: "May", totalRatings: 2150, avgRating: 4.4, activeUsers: 720 },
  { month: "Jun", totalRatings: 2380, avgRating: 4.3, activeUsers: 780 },
];

const categoryBreakdown = [
  { category: "Acting", avgRating: 4.2, totalRatings: 8500 },
  { category: "Plot", avgRating: 4.0, totalRatings: 8200 },
  { category: "Cinematography", avgRating: 4.4, totalRatings: 7800 },
  { category: "Direction", avgRating: 4.1, totalRatings: 8100 },
  { category: "Entertainment", avgRating: 4.3, totalRatings: 8400 },
];

const genrePopularity = [
  { genre: "Action", count: 2400, percentage: 28 },
  { genre: "Drama", count: 1800, percentage: 21 },
  { genre: "Comedy", count: 1500, percentage: 18 },
  { genre: "Thriller", count: 1200, percentage: 14 },
  { genre: "Sci-Fi", count: 900, percentage: 11 },
  { genre: "Horror", count: 700, percentage: 8 },
];

const userEngagement = [
  { day: "Mon", sessions: 320, ratings: 180, avgSession: 4.2 },
  { day: "Tue", sessions: 280, ratings: 160, avgSession: 3.8 },
  { day: "Wed", sessions: 350, ratings: 200, avgSession: 4.5 },
  { day: "Thu", sessions: 310, ratings: 175, avgSession: 4.1 },
  { day: "Fri", sessions: 420, ratings: 240, avgSession: 5.2 },
  { day: "Sat", sessions: 480, ratings: 280, avgSession: 5.8 },
  { day: "Sun", sessions: 450, ratings: 260, avgSession: 5.4 },
];

const topMovies = [
  { title: "The Dark Knight", ratings: 1250, avgRating: 4.8, trend: "up" },
  { title: "Inception", ratings: 1180, avgRating: 4.7, trend: "up" },
  { title: "Pulp Fiction", ratings: 1120, avgRating: 4.6, trend: "stable" },
  { title: "The Godfather", ratings: 1080, avgRating: 4.9, trend: "up" },
  { title: "Interstellar", ratings: 980, avgRating: 4.5, trend: "down" },
];

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("ratings");

  const exportData = (format: string) => {
    // Mock export functionality
    console.log(`Exporting data in ${format} format...`);
    // In real app, this would generate and download the file
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">12,847</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </div>
            </div>
            <Progress value={75} className="mt-2 bg-white" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">3,247</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2%
              </div>
            </div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">4.3</div>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                -0.1
              </div>
            </div>
            <Progress value={86} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">73%</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.3%
              </div>
            </div>
            <Progress value={73} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="bg-gray-900 border-gray-800 w-full sm:w-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 whitespace-nowrap"
            >
              Ratings Analysis
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 whitespace-nowrap"
            >
              User Behavior
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 whitespace-nowrap"
            >
              Content Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Rating Trends */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Rating Trends</CardTitle>
                <CardDescription>
                  Monthly rating activity and user growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    totalRatings: {
                      label: "Total Ratings",
                      color: "#3B82F6",
                    },
                    activeUsers: { label: "Active Users", color: "#10B981" },
                  }}
                  className="h-[250px] sm:h-[300px]"
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

            {/* Genre Distribution */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Genre Popularity</CardTitle>
                <CardDescription>
                  Distribution of ratings by movie genre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Ratings", color: "#3B82F6" },
                  }}
                  className="h-[250px] sm:h-[300px]"
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

          {/* Top Movies Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
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
                    key={movie.title}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {movie.title}
                        </div>
                        <div className="text-sm text-white">
                          {movie.ratings} ratings
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-white">
                          {movie.avgRating}
                        </span>
                      </div>
                      <Badge
                        variant={
                          movie.trend === "up"
                            ? "default"
                            : movie.trend === "down"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {movie.trend === "up"
                          ? "↗"
                          : movie.trend === "down"
                            ? "↘"
                            : "→"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Rating Categories Analysis
                </CardTitle>
                <CardDescription>Average ratings by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgRating: { label: "Average Rating", color: "#3B82F6" },
                  }}
                  className="h-[250px] sm:h-[300px]"
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

            {/* Rating Distribution */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Rating Distribution
                </CardTitle>
                <CardDescription>
                  How users rate across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="text-white">
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
          {/* User Engagement */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
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
                className="h-[300px] sm:h-[400px]"
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
          {/* Content Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Movies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1,247</div>
                <p className="text-xs text-white mt-1">+23 this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Avg Ratings per Movie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">10.3</div>
                <p className="text-xs text-white mt-1">+1.2 from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Rating Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">87%</div>
                <p className="text-xs text-white mt-1">
                  Users completing all 5 categories
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
