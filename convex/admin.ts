// convex/admin.ts
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all movies with view stats for admin dashboard
export const getMoviesWithStats = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("views"),
        v.literal("ratings"),
        v.literal("recent"),
        v.literal("title"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("published"),
        v.literal("draft"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const sortBy = args.sortBy || "views";

    // Get movies
    let moviesQuery = ctx.db.query("movies");

    if (args.status) {
      moviesQuery = moviesQuery.filter((q) =>
        q.eq(q.field("status"), args.status),
      );
    }

    let movies = await moviesQuery.collect();

    // Sort based on criteria
    switch (sortBy) {
      case "views":
        movies.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "ratings":
        movies.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case "recent":
        movies.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case "title":
        movies.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    movies = movies.slice(0, limit);

    // Enrich with additional stats
    const moviesWithStats = await Promise.all(
      movies.map(async (movie) => {
        // Get unique viewers from view history
        const viewHistory = await ctx.db
          .query("viewHistory")
          .withIndex("by_movie", (q) => q.eq("movieId", movie._id))
          .collect();

        const uniqueViewers = new Set(viewHistory.map((v) => v.userId)).size;

        // Get total ratings
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_movie", (q) => q.eq("movieId", movie._id))
          .collect();

        // Get community reviews count
        const reviews = await ctx.db
          .query("communityReviews")
          .withIndex("by_movie", (q) => q.eq("movieId", movie._id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();

        return {
          ...movie,
          stats: {
            totalViews: movie.views || 0, // ✅ Fast! No aggregation needed
            uniqueViewers,
            totalRatings: ratings.length,
            avgRating: movie.avgRating || 0,
            reviewsCount: reviews.length,
          },
        };
      }),
    );

    return moviesWithStats;
  },
});

// Get top performing movies by views
export const getTopMoviesByViews = query({
  args: {
    limit: v.optional(v.number()),
    timeframe: v.optional(
      v.union(
        v.literal("all_time"),
        v.literal("last_7_days"),
        v.literal("last_30_days"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const timeframe = args.timeframe || "all_time";

    if (timeframe === "all_time") {
      // ✅ Super fast query using stored view count
      const movies = await ctx.db
        .query("movies")
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();

      return movies
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit)
        .map((movie) => ({
          id: movie._id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          views: movie.views || 0,
          avgRating: movie.avgRating,
        }));
    }

    // For time-based queries, use analytics events
    const cutoffDate =
      timeframe === "last_7_days"
        ? Date.now() - 7 * 24 * 60 * 60 * 1000
        : Date.now() - 30 * 24 * 60 * 60 * 1000;

    const recentViews = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", cutoffDate))
      .filter((q) => q.eq(q.field("eventType"), "movie_view"))
      .collect();

    // Count views per movie
    const viewCounts = new Map<string, number>();
    recentViews.forEach((view) => {
      if (view.movieId) {
        viewCounts.set(view.movieId, (viewCounts.get(view.movieId) || 0) + 1);
      }
    });

    // Get movie details and sort
    const topMovieIds = Array.from(viewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map((entry) => entry[0]);

    const topMovies = await Promise.all(
      topMovieIds.map(async (movieId) => {
        const movie = await ctx.db.get(movieId as Id<"movies">);
        return movie
          ? {
              id: movie._id,
              title: movie.title,
              posterUrl: movie.posterUrl,
              views: viewCounts.get(movieId) || 0,
              totalViews: movie.views || 0, // Include all-time views too
              avgRating: movie.avgRating,
            }
          : null;
      }),
    );

    return topMovies.filter((m) => m !== null);
  },
});

// Get comprehensive dashboard stats
export const getDashboardStats = query({
  handler: async (ctx) => {
    // Get all movies
    const allMovies = await ctx.db.query("movies").collect();

    // ✅ Fast aggregation using stored view counts
    const totalViews = allMovies.reduce(
      (sum, movie) => sum + (movie.views || 0),
      0,
    );

    const publishedMovies = allMovies.filter((m) => m.status === "published");
    const draftMovies = allMovies.filter((m) => m.status === "draft");

    // Get total users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // Get total ratings
    const allRatings = await ctx.db.query("ratings").collect();
    const totalRatings = allRatings.length;

    // Get total reviews
    const allReviews = await ctx.db
      .query("communityReviews")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Get recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", oneDayAgo))
      .collect();

    const recentViews = recentEvents.filter(
      (e) => e.eventType === "movie_view",
    ).length;
    const recentRatings = recentEvents.filter(
      (e) => e.eventType === "rating_submitted",
    ).length;
    const recentSearches = recentEvents.filter(
      (e) => e.eventType === "search_performed",
    ).length;

    // Get top rated movies
    const topRatedMovies = publishedMovies
      .filter((m) => m.totalRatings && m.totalRatings >= 5) // Minimum 5 ratings
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .slice(0, 5)
      .map((m) => ({
        id: m._id,
        title: m.title,
        avgRating: m.avgRating,
        totalRatings: m.totalRatings,
      }));

    return {
      overview: {
        totalMovies: allMovies.length,
        publishedMovies: publishedMovies.length,
        draftMovies: draftMovies.length,
        totalUsers,
        totalViews, // ✅ Fast calculation
        totalRatings,
        totalReviews: allReviews.length,
      },
      recent24Hours: {
        views: recentViews,
        ratings: recentRatings,
        searches: recentSearches,
      },
      topRatedMovies,
    };
  },
});

// Get view trends over time
export const getViewTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all view events in time range
    const viewEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", startDate))
      .filter((q) => q.eq(q.field("eventType"), "movie_view"))
      .collect();

    // Group by day
    const dailyViews = new Map<string, number>();
    viewEvents.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split("T")[0];
      dailyViews.set(date, (dailyViews.get(date) || 0) + 1);
    });

    // Convert to array and fill missing days
    const trends: any = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      trends.unshift({
        date,
        views: dailyViews.get(date) || 0,
      });
    }

    return trends;
  },
});

// Get movie performance comparison
export const compareMoviePerformance = query({
  args: {
    movieIds: v.array(v.id("movies")),
  },
  handler: async (ctx, args) => {
    const comparisons = await Promise.all(
      args.movieIds.map(async (movieId) => {
        const movie = await ctx.db.get(movieId);
        if (!movie) return null;

        // Get detailed stats
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_movie", (q) => q.eq("movieId", movieId))
          .collect();

        const viewHistory = await ctx.db
          .query("viewHistory")
          .withIndex("by_movie", (q) => q.eq("movieId", movieId))
          .collect();

        const uniqueViewers = new Set(viewHistory.map((v) => v.userId)).size;

        // Calculate conversion rate (viewers who rated)
        const ratedUsers = new Set(ratings.map((r) => r.userId));
        const conversionRate =
          uniqueViewers > 0 ? (ratedUsers.size / uniqueViewers) * 100 : 0;

        return {
          id: movie._id,
          title: movie.title,
          views: movie.views || 0, // ✅ Fast access
          uniqueViewers,
          ratings: ratings.length,
          avgRating: movie.avgRating || 0,
          conversionRate: conversionRate.toFixed(2),
        };
      }),
    );

    return comparisons.filter((c) => c !== null);
  },
});
