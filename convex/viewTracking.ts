import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Track movie view - handles both logged in and logged out users
export const trackMovieView = mutation({
  args: {
    movieId: v.id("movies"),
    sessionId: v.optional(v.string()), // For anonymous users
    sessionDuration: v.optional(v.number()), // Optional: track how long they viewed
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    await ctx.db.patch(args.movieId, {
      views: (movie.views || 0) + 1,
      updatedAt: now,
    });

    // For logged-in users: track in view history
    if (userId) {
      // Check if user already viewed this movie recently (within last hour)
      // This prevents duplicate view history entries
      const recentView = await ctx.db
        .query("viewHistory")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("movieId"), args.movieId),
            q.gt(q.field("viewedAt"), now - 60 * 60 * 1000), // last hour
          ),
        )
        .first();

      if (!recentView) {
        // Create new view history entry
        await ctx.db.insert("viewHistory", {
          userId,
          movieId: args.movieId,
          viewedAt: now,
          sessionDuration: args.sessionDuration,
        });

        // Update user's last active timestamp
        await ctx.db.patch(userId, {
          lastActive: now,
        });
      } else if (args.sessionDuration) {
        // Update session duration if provided
        await ctx.db.patch(recentView._id, {
          sessionDuration: args.sessionDuration,
        });
      }
    }

    // Log analytics event for both logged-in and logged-out users
    await ctx.db.insert("analyticsEvents", {
      eventType: "movie_view",
      userId: userId || undefined,
      movieId: args.movieId,
      metadata: {
        sessionId: args.sessionId,
      },
      timestamp: now,
    });

    return { success: true, viewCount: (movie.views || 0) + 1 };
  },
});

// Get user's view history (logged-in users only)
export const getUserViewHistory = query({
  args: {
    limit: v.optional(v.number()),
    includeRewatched: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 50;
    const includeRewatched = args.includeRewatched || false;

    let viewHistory = await ctx.db
      .query("viewHistory")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(includeRewatched ? limit : limit * 2); // Get more if filtering

    // If not including rewatched, filter to unique movies
    if (!includeRewatched) {
      const seenMovies = new Set<string>();
      viewHistory = viewHistory
        .filter((view) => {
          if (seenMovies.has(view.movieId)) {
            return false;
          }
          seenMovies.add(view.movieId);
          return true;
        })
        .slice(0, limit);
    }

    // Fetch movie details
    const moviesWithDetails = await Promise.all(
      viewHistory.map(async (view) => {
        const movie = await ctx.db.get(view.movieId);
        return {
          ...view,
          movie,
        };
      }),
    );

    return moviesWithDetails.filter((item) => item.movie !== null);
  },
});

// Get recently viewed movies (for "Continue Watching" section)
export const getRecentlyViewed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 10;

    // Get recent views (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentViews = await ctx.db
      .query("viewHistory")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gt(q.field("viewedAt"), sevenDaysAgo))
      .order("desc")
      .collect();

    // Get unique movies (only most recent view of each)
    const uniqueMovieIds = new Map<string, (typeof recentViews)[0]>();
    for (const view of recentViews) {
      if (!uniqueMovieIds.has(view.movieId)) {
        uniqueMovieIds.set(view.movieId, view);
      }
    }

    const uniqueViews = Array.from(uniqueMovieIds.values()).slice(0, limit);

    // Fetch movie details
    const moviesWithDetails = await Promise.all(
      uniqueViews.map(async (view) => {
        const movie = await ctx.db.get(view.movieId);
        return {
          ...movie,
          lastViewedAt: view.viewedAt,
          sessionDuration: view.sessionDuration,
        };
      }),
    );

    return moviesWithDetails.filter((m) => m !== null);
  },
});

// Check if user has viewed a movie (used in UI to show "watched" badge)
export const hasUserViewedMovie = query({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const view = await ctx.db
      .query("viewHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .first();

    return !!view;
  },
});

// Get view statistics for a movie
export const getMovieViewStats = query({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    // Get total unique viewers (from view history)
    const uniqueViewers = await ctx.db
      .query("viewHistory")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();

    const uniqueUserIds = new Set(uniqueViewers.map((v) => v.userId));

    // Get views from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentViews = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", sevenDaysAgo))
      .filter((q) =>
        q.and(
          q.eq(q.field("eventType"), "movie_view"),
          q.eq(q.field("movieId"), args.movieId),
        ),
      )
      .collect();

    return {
      totalViews: movie.views || 0,
      uniqueViewers: uniqueUserIds.size,
      recentViews: recentViews.length,
      avgRating: movie.avgRating,
      totalRatings: movie.totalRatings || 0,
    };
  },
});

// Clean up old view history (maintenance task)
// Can be scheduled to run periodically
export const cleanupOldViewHistory = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const olderThanDays = args.olderThanDays || 180; // Default 6 months
    const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const oldViews = await ctx.db
      .query("viewHistory")
      .filter((q) => q.lt(q.field("viewedAt"), cutoffDate))
      .collect();

    for (const view of oldViews) {
      await ctx.db.delete(view._id);
    }

    return { deleted: oldViews.length };
  },
});
