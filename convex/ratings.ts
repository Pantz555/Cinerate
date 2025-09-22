import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitRating = mutation({
  args: {
    movieId: v.id("movies"),
    ratings: v.object({
      acting: v.number(),
      plot: v.number(),
      cinematography: v.number(),
      direction: v.number(),
      entertainment: v.number(),
    }),
    review: v.optional(v.string()),
    isPublicReview: v.optional(v.boolean()), // Whether to create a public community review
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized!");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate overall rating
    const overallRating =
      (args.ratings.acting +
        args.ratings.plot +
        args.ratings.cinematography +
        args.ratings.direction +
        args.ratings.entertainment) /
      5;

    // Check if user already rated this movie
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", user._id).eq("movieId", args.movieId),
      )
      .first();

    let ratingId;

    if (existingRating) {
      // Update existing rating
      ratingId = existingRating._id;
      await ctx.db.patch(existingRating._id, {
        ratings: args.ratings,
        overallRating,
        review: args.review,
        updatedAt: Date.now(),
      });
    } else {
      // Create new rating
      ratingId = await ctx.db.insert("ratings", {
        userId: user._id,
        movieId: args.movieId,
        ratings: args.ratings,
        overallRating,
        review: args.review,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // If user wants this as a public review and provided review text
    if (args.isPublicReview && args.review && args.review.trim().length > 0) {
      // Check if community review already exists
      const existingCommunityReview = await ctx.db
        .query("communityReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("movieId"), args.movieId))
        .first();

      if (existingCommunityReview) {
        await ctx.db.patch(existingCommunityReview._id, {
          content: args.review,
          rating: overallRating,
          updatedAt: Date.now(),
          isEdited: true,
        });
      } else {
        await ctx.db.insert("communityReviews", {
          userId: user._id,
          movieId: args.movieId,
          title: `Review for ${await getMovieTitle(ctx, args.movieId)}`,
          content: args.review,
          rating: overallRating,
          spoilerWarning: false,
          isEdited: false,
          likesCount: 0,
          repliesCount: 0,
          status: "published",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // Update movie's average rating
    await updateMovieRating(ctx, args.movieId);

    await updateUserRatingAchievements(ctx, user._id);

    return { success: true, ratingId };
  },
});

export const getUserRating = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized!");
    }

    const user = await ctx.db.get(userId);

    if (!user) return null;

    return await ctx.db
      .query("ratings")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", user._id).eq("movieId", args.movieId),
      )
      .first();
  },
});

// Helper functions
async function getMovieTitle(ctx: any, movieId: string) {
  const movie = await ctx.db.get(movieId);
  return movie?.title || "Unknown Movie";
}

async function updateMovieRating(ctx: any, movieId: string) {
  const ratings = await ctx.db
    .query("ratings")
    .withIndex("by_movie", (q: any) => q.eq("movieId", movieId))
    .collect();

  if (ratings.length === 0) return;

  const avgRating =
    ratings.reduce((sum: any, r: any) => sum + r.overallRating, 0) /
    ratings.length;

  await ctx.db.patch(movieId, {
    avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    totalRatings: ratings.length,
    reviews: ratings.filter((r: any) => r.review && r.review.trim().length > 0)
      .length,
    updatedAt: Date.now(),
  });
}

export const getRatingDistribution = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    // Fetch all ratings for the movie
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .collect();

    // Initialize buckets for star ratings (1 to 5)
    const buckets: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const totalRatings = ratings.length;

    // Count ratings in each bucket
    ratings.forEach((rating) => {
      // Round overallRating to the nearest integer (1 to 5)
      const star = Math.round(rating.overallRating);
      if (star >= 1 && star <= 5) {
        buckets[star]++;
      }
    });

    // Calculate percentages
    const distribution = Object.fromEntries(
      Object.entries(buckets).map(([star, count]: any) => [
        star,
        totalRatings > 0 ? (count / totalRatings) * 100 : 0,
      ]),
    );

    return { distribution, totalRatings };
  },
});

async function updateUserRatingAchievements(ctx: any, userId: string) {
  // Get user’s ratings
  const ratings = await ctx.db
    .query("ratings")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const ratingCount = ratings.length;
  const lowRatings = ratings.filter((r: any) => r.overallRating <= 2).length;
  const highRatings = ratings.filter((r: any) => r.overallRating === 5).length;

  // Collect genre diversity
  const movieIds = ratings.map((r: any) => r.movieId);
  const movies = await Promise.all(movieIds.map((id: any) => ctx.db.get(id)));
  const uniqueGenres = new Set(
    movies.flatMap((m) => (m?.genres ? m.genres : [])),
  );

  // Get rating-related achievements from DB
  const achievements = await ctx.db
    .query("achievements")
    .withIndex("by_category", (q: any) => q.eq("category", "ratings"))
    .collect();

  for (const achievement of achievements) {
    const { type, value } = achievement.requirement;

    let achieved = false;
    switch (type) {
      case "total_ratings":
        achieved = ratingCount >= value;
        break;
      case "low_ratings":
        achieved = lowRatings >= value;
        break;
      case "high_ratings":
        achieved = highRatings >= value;
        break;
      case "genre_diversity":
        achieved = uniqueGenres.size >= value;
        break;
    }

    if (achieved) {
      const alreadyEarned = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_achievement", (q: any) =>
          q.eq("userId", userId).eq("achievementId", achievement._id),
        )
        .first();

      if (!alreadyEarned) {
        await ctx.db.insert("userAchievements", {
          userId,
          achievementId: achievement._id,
          earnedAt: Date.now(),
          progress: 100,
        });
      }
    }
  }
}
