import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user notifications
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 50;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return notifications;
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false),
      )
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return { success: true };
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false),
      )
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true }),
      ),
    );

    return { success: true, count: unreadNotifications.length };
  },
});

// Create notification (internal function for other mutations to use)
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("new_review"),
      v.literal("rating_response"),
      v.literal("review_like"),
      v.literal("comment_reply"),
      v.literal("new_follower"),
      v.literal("achievement_unlocked"),
      v.literal("trending_movie"),
      v.literal("recommendation"),
      v.literal("movie_updated"),
      v.literal("movie_deleted"),
    ),
    actorId: v.optional(v.id("users")),
    action: v.string(),
    target: v.string(),
    targetId: v.optional(v.string()),
    targetType: v.optional(
      v.union(
        v.literal("movie"),
        v.literal("review"),
        v.literal("comment"),
        v.literal("user"),
        v.literal("achievement"),
      ),
    ),
    metadata: v.optional(
      v.object({
        movieTitle: v.optional(v.string()),
        movieId: v.optional(v.id("movies")),
        reviewId: v.optional(v.id("communityReviews")),
        commentId: v.optional(v.id("movieComments")),
        achievementTitle: v.optional(v.string()),
        posterUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get actor details if actorId is provided
    let actorName: string | undefined;
    let actorImage: string | undefined;

    if (args.actorId) {
      const actor = await ctx.db.get(args.actorId);
      if (actor) {
        actorName = actor.name;
        actorImage = actor.image;
      }
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      actorId: args.actorId,
      actorName,
      actorImage,
      action: args.action,
      target: args.target,
      targetId: args.targetId,
      targetType: args.targetType,
      metadata: args.metadata,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.notificationId);

    return { success: true };
  },
});

// Delete all read notifications
export const deleteAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const readNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", true),
      )
      .collect();

    await Promise.all(
      readNotifications.map((notification) => ctx.db.delete(notification._id)),
    );

    return { success: true, count: readNotifications.length };
  },
});
