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

    // Get genre distribution and favorite genres
    const movieIds = ratings.map((r) => r.movieId);
    const movies = await Promise.all(movieIds.map((id) => ctx.db.get(id)));

    const genreCount: Record<string, number> = {};
    const genreRatings: Record<string, number[]> = {};

    movies.forEach((movie, index) => {
      if (movie?.genres) {
        // Handle multiple genres per movie
        movie.genres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
          if (!genreRatings[genre]) {
            genreRatings[genre] = [];
          }
          genreRatings[genre].push(ratings[index].overallRating);
        });
      } else if (movie?.genre) {
        // Fallback to single genre field
        genreCount[movie.genre] = (genreCount[movie.genre] || 0) + 1;
        if (!genreRatings[movie.genre]) {
          genreRatings[movie.genre] = [];
        }
        genreRatings[movie.genre].push(ratings[index].overallRating);
      }
    });

    // Calculate favorite genres (top 3 by average rating and count)
    const favoriteGenres = Object.entries(genreRatings)
      .map(([genre, ratingsList]) => {
        const avgGenreRating =
          ratingsList.reduce((sum, r) => sum + r, 0) / ratingsList.length;
        return {
          genre,
          count: genreCount[genre],
          avgRating: avgGenreRating,
          // Score combines rating and count (weighted)
          score:
            avgGenreRating * 0.7 +
            (genreCount[genre] / totalRatings) * 10 * 0.3,
        };
      })
      .filter((g) => g.count >= 2) // Only genres with at least 2 ratings
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((g) => g.genre);

    // Calculate personality profile
    const personalityProfile = calculatePersonalityProfile(
      ratings,
      movies,
      genreCount,
    );

    const viewHistory = await ctx.db
      .query("viewHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      currentStreak,
      ratingDistribution,
      viewCount: viewHistory.length,
      genreDistribution: Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count),
      favoriteGenres, // New: top 3 favorite genres
      personalityProfile, // New: personality traits
    };
  },
});

// Helper function to calculate personality profile
function calculatePersonalityProfile(
  ratings: any[],
  movies: any[],
  genreCount: Record<string, number>,
) {
  const totalRatings = ratings.length;

  if (totalRatings === 0) {
    return {
      adventurous: 0,
      critical: 0,
      social: 0,
      binge: 0,
    };
  }

  // Adventurous: Genre diversity (0-1)
  const uniqueGenres = Object.keys(genreCount).length;
  const adventurous = Math.min(uniqueGenres / 10, 1); // Max out at 10 genres

  // Critical: Tendency to rate harshly (0-1)
  // Lower average rating = more critical
  const avgRating =
    ratings.reduce((sum, r) => r.overallRating + sum, 0) / totalRatings;
  const critical = 1 - (avgRating - 1) / 4; // Normalize 1-5 rating to 0-1 scale (inverted)

  // Social: Engagement with community features (placeholder)
  // This would be calculated based on reviews, comments, follows, etc.
  // For now, we'll use a simple metric based on reviews
  const reviewCount = ratings.filter(
    (r) => r.review && r.review.length > 0,
  ).length;
  const social = Math.min(reviewCount / totalRatings, 1);

  // Binge: Rating frequency
  // Calculate ratings per day over last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentRatings = ratings.filter((r) => r.createdAt > thirtyDaysAgo);
  const ratingsPerDay = recentRatings.length / 30;
  const binge = Math.min(ratingsPerDay / 2, 1); // Max out at 2 ratings per day

  return {
    adventurous: Math.round(adventurous * 100) / 100,
    critical: Math.round(critical * 100) / 100,
    social: Math.round(social * 100) / 100,
    binge: Math.round(binge * 100) / 100,
  };
}
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
