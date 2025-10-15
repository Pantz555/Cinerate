import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Helper to create notification from within other mutations
export async function createNotificationHelper(
  ctx: any,
  params: {
    userId: Id<"users">;
    type: string;
    actorId?: Id<"users">;
    action: string;
    target: string;
    targetId?: string;
    targetType?: string;
    metadata?: any;
  },
) {
  let actorName: string | undefined;
  let actorImage: string | undefined;

  if (params.actorId) {
    const actor = await ctx.db.get(params.actorId);
    if (actor) {
      actorName = actor.name;
      actorImage = actor.image;
    }
  }

  return await ctx.db.insert("notifications", {
    userId: params.userId,
    type: params.type as any,
    actorId: params.actorId,
    actorName,
    actorImage,
    action: params.action,
    target: params.target,
    targetId: params.targetId,
    targetType: params.targetType as any,
    metadata: params.metadata,
    isRead: false,
    createdAt: Date.now(),
  });
}

// Example: When someone likes a review
export const notifyReviewLiked = mutation({
  args: {
    reviewId: v.id("communityReviews"),
    likerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get review details
    const review = await ctx.db.get(args.reviewId);
    if (!review || review.userId === args.likerId) {
      // Don't notify if user likes their own review
      return;
    }

    const movie = await ctx.db.get(review.movieId);

    await createNotificationHelper(ctx, {
      userId: review.userId,
      type: "review_like",
      actorId: args.likerId,
      action: "liked your review on",
      target: movie?.title || "a movie",
      targetId: args.reviewId,
      targetType: "review",
      metadata: {
        movieTitle: movie?.title,
        movieId: review.movieId,
        reviewId: args.reviewId,
        posterUrl: movie?.posterUrl,
      },
    });
  },
});

// Example: When someone replies to a comment
export const notifyCommentReply = mutation({
  args: {
    commentId: v.id("movieComments"),
    replierId: v.id("users"),
    replyContent: v.string(),
  },
  handler: async (ctx, args) => {
    // Get comment details
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.userId === args.replierId) {
      // Don't notify if user replies to their own comment
      return;
    }

    const movie = await ctx.db.get(comment.movieId);

    await createNotificationHelper(ctx, {
      userId: comment.userId,
      type: "comment_reply",
      actorId: args.replierId,
      action: "replied to your comment on",
      target: movie?.title || "a movie",
      targetId: args.commentId,
      targetType: "comment",
      metadata: {
        movieTitle: movie?.title,
        movieId: comment.movieId,
        commentId: args.commentId,
        posterUrl: movie?.posterUrl,
      },
    });
  },
});

// Example: When someone follows a user
export const notifyNewFollower = mutation({
  args: {
    followedUserId: v.id("users"),
    followerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await createNotificationHelper(ctx, {
      userId: args.followedUserId,
      type: "new_follower",
      actorId: args.followerId,
      action: "started following you",
      target: "",
      targetId: args.followerId,
      targetType: "user",
    });
  },
});

// Example: When a user unlocks an achievement
export const notifyAchievementUnlocked = mutation({
  args: {
    userId: v.id("users"),
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement) return;

    await createNotificationHelper(ctx, {
      userId: args.userId,
      type: "achievement_unlocked",
      action: "unlocked",
      target: achievement.title,
      targetId: args.achievementId,
      targetType: "achievement",
      metadata: {
        achievementTitle: achievement.title,
      },
    });
  },
});

// Example: When a new review is posted on a movie the user rated
export const notifyNewReview = mutation({
  args: {
    movieId: v.id("movies"),
    reviewerId: v.id("users"),
    reviewId: v.id("communityReviews"),
  },
  handler: async (ctx, args) => {
    // Find all users who rated this movie (excluding the reviewer)
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();

    const movie = await ctx.db.get(args.movieId);

    // Notify each user who rated this movie
    const uniqueUsers = new Set(
      ratings.filter((r) => r.userId !== args.reviewerId).map((r) => r.userId),
    );

    for (const userId of uniqueUsers) {
      await createNotificationHelper(ctx, {
        userId,
        type: "new_review",
        actorId: args.reviewerId,
        action: "posted a review on",
        target: movie?.title || "a movie",
        targetId: args.reviewId,
        targetType: "review",
        metadata: {
          movieTitle: movie?.title,
          movieId: args.movieId,
          reviewId: args.reviewId,
          posterUrl: movie?.posterUrl,
        },
      });
    }
  },
});
