// convex/profile.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user profile stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get total ratings count
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalRatings = ratings.length;

    // Calculate average rating
    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + rating.overallRating, 0) /
          totalRatings
        : 0;

    // Get current streak
    const user = await ctx.db.get(userId);
    const currentStreak = user?.currentStreak || 0;

    // Get rating distribution for chart
    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
      const count = ratings.filter(
        (r) => Math.floor(r.overallRating) === star,
      ).length;
      const percentage =
        totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
      return {
        rating: `${star}★`,
        count,
        percentage,
      };
    });

    // Get genre distribution
    const movieIds = ratings.map((r) => r.movieId);
    const movies = await Promise.all(movieIds.map((id) => ctx.db.get(id)));

    const genreCount: Record<string, number> = {};
    movies.forEach((movie) => {
      if (movie?.genre) {
        genreCount[movie.genre] = (genreCount[movie.genre] || 0) + 1;
      }
    });

    return {
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      currentStreak,
      ratingDistribution,
      genreDistribution: Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
});

// Get user achievements
export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's earned achievements
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get achievement details
    const achievements = await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await ctx.db.get(ua.achievementId);
        return {
          ...achievement,
          earnedAt: ua.earnedAt,
          progress: ua.progress,
        };
      }),
    );

    return achievements
      .filter((a) => a)
      .sort((a, b) => b.earnedAt - a.earnedAt);
  },
});

// Update user streak (called daily or when rating)
export const updateStreak = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const today = Math.floor(now / oneDayMs);
    const lastRatingDay = user.lastRatingDate
      ? Math.floor(user.lastRatingDate / oneDayMs)
      : 0;

    let newStreak = user.currentStreak || 0;

    if (lastRatingDay === today - 1) {
      // Consecutive day, increment streak
      newStreak += 1;
    } else if (lastRatingDay < today - 1) {
      // Streak broken, reset to 0
      newStreak = 0;
    }
    // If lastRatingDay === today, keep current streak

    await ctx.db.patch(userId, {
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak || 0, newStreak),
      lastRatingDate: now,
    });

    return newStreak;
  },
});

export const getRatingPatterns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const months: string[] = [];

    // Build an array of the last 12 months (YYYY-MM format)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push(key);
    }

    // Count ratings per month
    const monthlyData: Record<string, number> = {};
    ratings.forEach((rating) => {
      const date = new Date(rating.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Ensure all months exist, with 0 if no ratings
    return months.map((m) => ({
      month: m,
      count: monthlyData[m] || 0,
    }));
  },
});
