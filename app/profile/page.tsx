"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Home,
  Search,
  List,
  MessageSquare,
  User,
  Edit,
  Star,
  Trophy,
  X,
  Settings,
  Menu,
  LogOut,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex-helpers/react";
import MovieSkeleton from "@/components/skeleton/movie-skeleton";
import EditModal from "@/components/edit-modal";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfilePage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const { data: user } = useQueryWithStatus(api.auth.loggedInUser);

  const { data: recentlyRatedMovies } = useQuery(
    api.movies.getUserRecentlyRatedMovies,
    {
      limit: 5,
    },
  );

  const { data: personalizedPicks } = useQuery(
    api.movies.getPersonalizedPicks,
    {
      limit: 5,
    },
  );

  // New queries for real stats
  const { data: userStats } = useQuery(api.profile.getUserStats, {});
  const { data: userAchievements } = useQuery(
    api.profile.getUserAchievements,
    {},
  );
  const { data: ratingPatterns } = useQuery(api.profile.getRatingPatterns, {});

  const { signOut } = useAuthActions();

  // Default achievements with actual achievement icons
  const defaultAchievements = [
    {
      title: "First Steps",
      description: "Rated your first movie",
      icon: "🎬",
    },
    {
      title: "Movie Enthusiast",
      description: "Rated 50 movies",
      icon: "🍿",
    },
    {
      title: "Cinema Connoisseur",
      description: "Rated 100 movies",
      icon: "🏆",
    },
    {
      title: "Active Week",
      description: "Rated movies for 7 days straight",
      icon: "📅",
    },
  ];

  // Use real achievements if available, otherwise show defaults
  const displayAchievements =
    userAchievements && userAchievements.length > 0
      ? userAchievements.slice(0, 4)
      : defaultAchievements;

  // Function to fetch user rating for a specific movie
  const openEditModal = async (movie: any) => {
    setSelectedMovie(movie);
    setEditModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 p-6 flex flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="size-12 shrink-0 rounded-full bg-[#292d38] bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: user?.image
                  ? `url("${user.image}")`
                  : undefined,
              }}
            >
              {!user?.image && (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-white text-lg font-semibold">
                {user?.name || "Anonymous"}
              </h1>
              <p className="text-sm font-normal text-slate-400">
                @{user?.name || "Anonymous"}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { name: "Home", icon: Home, href: "/" },
              { name: "Explore", icon: Search, href: "/discover" },
              { name: "Lists", icon: List, href: "/lists" },
              { name: "Reviews", icon: MessageSquare, href: "/community" },
              { name: "Profile", icon: User, href: "/profile" },
              {
                name: "Personalization",
                icon: Settings,
                href: "/personalization",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-200 ${
                  item.name === "Profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setActiveNav(item.name)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              onClick={signOut}
              className="flex items-center gap-3 text-black"
              variant="outline"
            >
              <LogOut />
              Logout
            </Button>
          </nav>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 p-6 flex flex-col justify-between z-[70] transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="size-12 shrink-0 rounded-full bg-[#292d38] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: user?.image
                    ? `url("${user?.image}")`
                    : undefined,
                }}
              >
                {!user?.image && (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-white text-lg font-semibold">
                  {" "}
                  {user?.name || "Anonymous"}
                </h1>
                <p className="text-sm font-normal text-slate-400">
                  @ {user?.name || "Anonymous"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { name: "Home", icon: Home, href: "/" },
              { name: "Explore", icon: Search, href: "/discover" },
              { name: "Lists", icon: List, href: "/lists" },
              { name: "Reviews", icon: MessageSquare, href: "/community" },
              { name: "Profile", icon: User, href: "/profile" },

              {
                name: "Personalization",
                icon: Settings,
                href: "/personalization",
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-200 ${
                  item.name === "Profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => {
                  setActiveNav(item.name);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              onClick={signOut}
              className="flex items-center gap-3 text-black"
              variant="outline"
            >
              <LogOut />
              Logout
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="text-white hover:bg-slate-700 p-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-white text-xl font-bold">Profile</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <header className="mb-10">
          <h1 className="text-white text-2xl lg:text-4xl font-bold tracking-tighter">
            Welcome back, {user?.name || "Anonymous"}!
          </h1>
          <p className="text-base mt-1 text-slate-400">
            Here's a look at your rating journey.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Quick Access
          </h2>
          <div className="grid grid-cols-1">
            <Link href="/personalization">
              <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300 cursor-pointer group">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-green-400 group-hover:text-green-300" />
                    <p className="text-white font-semibold">Personalization</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Customize your experience and manage recommendation
                    preferences
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recently Rated Section */}
        <section className="mb-12">
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Recently Rated
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {recentlyRatedMovies === undefined ? (
              [...Array(10)].map((_, i) => <MovieSkeleton key={i} />)
            ) : recentlyRatedMovies && recentlyRatedMovies.length > 0 ? (
              recentlyRatedMovies?.map((movie, index) => (
                <div
                  key={movie._id}
                  className="flex flex-col gap-3 group cursor-pointer"
                >
                  <div className="relative">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundImage: `url("${movie.posterUrl}")` }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30"
                        onClick={() => openEditModal(movie)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold truncate text-sm lg:text-base">
                      {movie.title}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-400">
                      {movie.genre}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No rated movies at the moment</p>
            )}
          </div>
        </section>

        {/* Stats and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Your Stats */}
            <section className="mb-8">
              <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                Your Stats
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Total Ratings
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter">
                      {userStats?.totalRatings || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Average Rating
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter flex items-center gap-2">
                      {userStats?.avgRating || 0}{" "}
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-transparent hover:border-blue-600 transition-colors duration-300">
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-base font-medium mb-2 text-slate-400">
                      Rating Streak
                    </p>
                    <p className="text-white text-3xl lg:text-4xl font-bold tracking-tighter">
                      {userStats?.currentStreak || 0}{" "}
                      <span className="text-lg font-medium text-slate-400">
                        Days
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Rating Patterns Chart */}
            <section className="mb-8">
              <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                Rating Distribution
              </h2>
              <Card className="bg-slate-800 border-transparent">
                <CardHeader>
                  <CardTitle className="text-white font-semibold">
                    Your Rating Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Number of Ratings",
                        color: "#3b82f6",
                      },
                    }}
                    className="h-48 w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userStats?.ratingDistribution || []}>
                        <XAxis
                          dataKey="rating"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#D1D5DB", fontSize: 12 }}
                        />
                        <YAxis hide />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          className=""
                          activeBar={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </section>

            {/* Rating Activity Over Time */}
            {ratingPatterns && ratingPatterns.length > 0 && (
              <section>
                <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                  Rating Activity
                </h2>
                <Card className="bg-slate-800 border-transparent">
                  <CardHeader>
                    <CardTitle className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Monthly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: {
                          label: "Ratings",
                          color: "#10b981",
                        },
                      }}
                      className="h-48 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ratingPatterns}>
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#D1D5DB", fontSize: 12 }}
                            tickFormatter={(value) => {
                              const [year, month] = value.split("-");
                              const monthNames = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ];
                              return monthNames[parseInt(month) - 1];
                            }}
                          />
                          <YAxis hide />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                            activeDot={{
                              r: 6,
                              stroke: "#10b981",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          {/* Achievements Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="bg-slate-800 border-transparent">
              <CardHeader>
                <CardTitle className="text-white text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userAchievements?.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm lg:text-base">
                        {achievement.title}
                      </p>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {achievement.description}
                      </p>
                      {achievement?.earnedAt && (
                        <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(achievement?.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {(!userAchievements || userAchievements.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm">
                      Start rating movies to unlock achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Genre Distribution */}
            {userStats?.genreDistribution &&
              userStats.genreDistribution.length > 0 && (
                <Card className="bg-slate-800 border-transparent mt-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg font-bold tracking-tight">
                      Favorite Genres
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userStats.genreDistribution
                      .slice(0, 5)
                      .map((genre, index) => {
                        const percentage = Math.round(
                          (genre.count / userStats.totalRatings) * 100,
                        );
                        return (
                          <div
                            key={genre.genre}
                            className="flex items-center justify-between"
                          >
                            <span className="text-white text-sm font-medium">
                              {genre.genre}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-slate-400 text-xs w-8 text-right">
                                {genre.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              )}
          </aside>
        </div>

        {/* Personalized Recommendations */}
        <section>
          <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 tracking-tight">
            Personalized Recommendations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {personalizedPicks === undefined ? (
              [...Array(10)].map((_, i) => <MovieSkeleton key={i} />)
            ) : personalizedPicks.length > 0 ? (
              personalizedPicks?.map((movie) => (
                <Link key={movie._id} href={`/movie/${movie._id}`}>
                  <div className="flex flex-col gap-3 group cursor-pointer">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundImage: `url("${movie.posterUrl}")` }}
                    />
                    <div>
                      <p className="text-white font-semibold truncate text-sm lg:text-base">
                        {movie.title}
                      </p>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {movie.genre}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400">
                No personalized movies at the moment
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Edit Rating Modal */}
      {editModalOpen && (
        <EditModal
          id={selectedMovie?._id as Id<"movies">}
          setEditModalOpen={setEditModalOpen}
        />
      )}
    </div>
  );
}
