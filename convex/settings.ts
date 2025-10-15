import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return default settings if none exist
    if (!settings) {
      return {
        notifications: {
          emailNotifications: true,
          newReviews: true,
          ratingResponses: false,
          weeklyDigest: true,
          trendingMovies: true,
          recommendations: true,
          communityActivity: false,
          achievements: true,
        },
        privacy: {
          profileVisibility: "public" as const,
          showRatings: true,
          showLists: true,
        },
      };
    }

    return settings;
  },
});

// Update notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    notifications: v.object({
      emailNotifications: v.boolean(),
      newReviews: v.boolean(),
      ratingResponses: v.boolean(),
      weeklyDigest: v.boolean(),
      trendingMovies: v.boolean(),
      recommendations: v.boolean(),
      communityActivity: v.boolean(),
      achievements: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        notifications: args.notifications,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        notifications: args.notifications,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Update privacy settings
export const updatePrivacySettings = mutation({
  args: {
    privacy: v.object({
      profileVisibility: v.union(
        v.literal("public"),
        v.literal("friends"),
        v.literal("private"),
      ),
      showRatings: v.boolean(),
      showLists: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        privacy: args.privacy,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        notifications: {
          emailNotifications: true,
          newReviews: true,
          ratingResponses: false,
          weeklyDigest: true,
          trendingMovies: true,
          recommendations: true,
          communityActivity: false,
          achievements: true,
        },
        privacy: args.privacy,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Export user data (for data export feature)
export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all user ratings with movie details
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ratingsWithMovies = await Promise.all(
      ratings.map(async (rating) => {
        const movie = await ctx.db.get(rating.movieId);
        return {
          movieTitle: movie?.title || "Unknown",
          genre: movie?.genres?.join(", ") || movie?.genre || "",
          ratings: {
            acting: rating.ratings.acting,
            plot: rating.ratings.plot,
            cinematography: rating.ratings.cinematography,
            direction: rating.ratings.direction,
            entertainment: rating.ratings.entertainment,
            overall: rating.overallRating,
          },
          review: rating.review || "",
          ratedAt: new Date(rating.createdAt).toISOString(),
        };
      }),
    );

    return ratingsWithMovies;
  },
});
