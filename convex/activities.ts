import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create activity entry
export const createActivity = mutation({
  args: {
    userId: v.id("users"),
    activityType: v.union(
      v.literal("movie_created"),
      v.literal("movie_updated"),
      v.literal("movie_deleted"),
      v.literal("movie_status_changed"),
      v.literal("review_posted"),
      v.literal("review_liked"),
      v.literal("movie_rated"),
      v.literal("user_followed"),
    ),
    targetId: v.string(),
    targetType: v.union(
      v.literal("movie"),
      v.literal("review"),
      v.literal("user"),
    ),
    metadata: v.optional(
      v.object({
        movieTitle: v.optional(v.string()),
        movieId: v.optional(v.id("movies")),
        oldStatus: v.optional(v.string()),
        newStatus: v.optional(v.string()),
        rating: v.optional(v.number()),
        posterUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new ConvexError("Unauthorized");
    }

    // For admin activities, we'll create entries for all users to see
    // You might want to filter this based on user roles
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.insert("activityFeed", {
      userId: user?._id,
      actorId: args.userId,
      activityType: args.activityType,
      targetId: args.targetId,
      targetType: args.targetType,
      metadata: args.metadata,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Get recent activities for admin dashboard
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 10;

    // Get activities for the current user
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Enrich activities with additional data
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const actor = await ctx.db.get(activity.actorId);
        let movieData = null;

        if (activity.targetType === "movie" && activity.metadata?.movieId) {
          movieData = await ctx.db.get(activity.metadata.movieId);
        }

        return {
          ...activity,
          actor: {
            name: actor?.name || "Unknown User",
            email: actor?.email,
          },
          movieData,
        };
      }),
    );

    return enrichedActivities;
  },
});

// Get admin-specific activities (movie management actions)
export const getAdminActivities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") {
      throw new ConvexError("Access denied");
    }

    const limit = args.limit || 20;

    // Get all admin-related activities
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Filter for admin activities only
    const adminActivities = activities.filter((activity) =>
      [
        "movie_created",
        "movie_updated",
        "movie_deleted",
        "movie_status_changed",
      ].includes(activity.activityType),
    );

    // Enrich with actor and movie data
    const enrichedActivities = await Promise.all(
      adminActivities.map(async (activity) => {
        const actor = await ctx.db.get(activity.actorId);
        let movieData = null;

        if (activity.targetType === "movie" && activity.metadata?.movieId) {
          movieData = await ctx.db.get(activity.metadata.movieId);
        }

        return {
          ...activity,
          actor: {
            name: actor?.name || "Unknown User",
            email: actor?.email,
          },
          movieData,
        };
      }),
    );

    return enrichedActivities;
  },
});

// Mark activities as read
export const markActivitiesAsRead = mutation({
  args: {
    activityIds: v.array(v.id("activityFeed")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Unauthorized");
    }

    for (const activityId of args.activityIds) {
      const activity = await ctx.db.get(activityId);
      if (activity && activity.userId === userId) {
        await ctx.db.patch(activityId, { isRead: true });
      }
    }
  },
});

// Delete all admin activities
export const deleteAllAdminActivities = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("Access denied");
    }

    // Get all admin activities (not limited, delete all)
    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const adminActivities = activities.filter((activity) =>
      [
        "movie_created",
        "movie_updated",
        "movie_deleted",
        "movie_status_changed",
      ].includes(activity.activityType),
    );

    for (const activity of adminActivities) {
      await ctx.db.delete(activity._id);
    }

    return { deleted: adminActivities.length };
  },
});
