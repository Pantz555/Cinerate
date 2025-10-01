import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

// Generate personalized recommendations for a user
export const generateRecommendations = mutation({
  args: {
    limit: v.optional(v.number()),
    refreshCache: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const limit = args.limit || 20;

    // Check if we have recent recommendations (less than 1 hour old)
    if (!args.refreshCache) {
      const existingRecs = await ctx.db
        .query("recommendations")
        .withIndex("by_user_score", (q) => q.eq("userId", userId))
        .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
        .take(limit);

      if (existingRecs.length >= limit) {
        return existingRecs.map((rec) => rec.movieId);
      }
    }

    // Get user data
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Get user's ratings
    const userRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get user's viewing history
    const viewHistory = await ctx.db
      .query("viewHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get all published movies
    const allMovies = await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Filter out already watched/rated movies
    const watchedMovieIds = new Set([
      ...userRatings.map((r) => r.movieId),
      ...viewHistory.map((v) => v.movieId),
    ]);

    const candidateMovies = allMovies.filter(
      (movie) => !watchedMovieIds.has(movie._id),
    );

    // Calculate scores for each candidate movie
    const scoredMovies = await Promise.all(
      candidateMovies.map(async (movie) => {
        const contentScore = calculateContentBasedScore(
          movie,
          userRatings,
          allMovies,
          user,
        );
        const collaborativeScore = await calculateCollaborativeScore(
          ctx,
          movie,
          userId,
          userRatings,
        );
        const trendingScore = calculateTrendingScore(movie);
        const diversityBonus = calculateDiversityBonus(
          movie,
          userRatings,
          allMovies,
          user,
        );

        // Weighted combination
        const finalScore =
          contentScore * 0.4 +
          collaborativeScore * 0.3 +
          trendingScore * 0.2 +
          diversityBonus * 0.1;

        // Determine algorithm type and reason
        const { algorithm, reason } = determineRecommendationType(
          contentScore,
          collaborativeScore,
          trendingScore,
          diversityBonus,
          movie,
        );

        return {
          movie,
          score: finalScore,
          algorithm,
          reason,
        };
      }),
    );

    // Sort by score and take top recommendations
    const topRecommendations = scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Save recommendations to database
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
await Promise.all(
  topRecommendations.map(async (rec) => {
    // Check if a recommendation already exists for this user/movie
    const existing = await ctx.db
      .query("recommendations")
      .withIndex("by_user_movie", (q) =>
        q.eq("userId", userId).eq("movieId", rec.movie._id),
      )
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        score: rec.score,
        reason: rec.reason,
        algorithm: rec.algorithm,
        createdAt: Date.now(),
        expiresAt,
      });
    } else {
      // Insert new record
      await ctx.db.insert("recommendations", {
        userId,
        movieId: rec.movie._id,
        score: rec.score,
        reason: rec.reason,
        algorithm: rec.algorithm,
        createdAt: Date.now(),
        expiresAt,
      });
    }
  }),
);


    return topRecommendations.map((rec) => rec.movie._id);
  },
});

// Get user's recommendations
export const getUserRecommendations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user_score", (q) => q.eq("userId", userId))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .order("desc")
      .take(limit);

    // Fetch movie details
    const moviesWithDetails = await Promise.all(
      recommendations.map(async (rec) => {
        const movie = await ctx.db.get(rec.movieId);
        return {
          ...movie,
          recommendationScore: rec.score,
          recommendationReason: rec.reason,
          recommendationAlgorithm: rec.algorithm,
        };
      }),
    );

    return moviesWithDetails.filter((m) => m !== null);
  },
});

// Content-based filtering: similar movies based on genres, directors, etc.
function calculateContentBasedScore(
  movie: Doc<"movies">,
  userRatings: Doc<"ratings">[],
  allMovies: Doc<"movies">[],
  user: Doc<"users">,
): number {
  if (userRatings.length === 0) return 0.5; // neutral score for new users

  // Get highly rated movies by user (rating >= 4)
  const likedMovies = userRatings
    .filter((r) => r.overallRating >= 4)
    .map((r) => allMovies.find((m) => m._id === r.movieId))
    .filter((m) => m !== undefined) as Doc<"movies">[];

  if (likedMovies.length === 0) return 0.5;

  // Calculate similarity scores
  let totalSimilarity = 0;
  let count = 0;

  for (const likedMovie of likedMovies) {
    let similarity = 0;

    // Genre similarity
    const movieGenres = movie.genres || [];
    const likedGenres = likedMovie.genres || [];
    const genreOverlap = movieGenres.filter((g) =>
      likedGenres.includes(g),
    ).length;
    similarity += (genreOverlap / Math.max(movieGenres.length, 1)) * 0.4;

    // Director match
    if (movie.director === likedMovie.director) {
      similarity += 0.3;
    }

    // Era similarity (within 5 years)
    const yearDiff = Math.abs(parseInt(movie.year) - parseInt(likedMovie.year));
    if (yearDiff <= 5) {
      similarity += 0.2;
    }

    // Rating similarity
    if (movie.avgRating && likedMovie.avgRating) {
      const ratingDiff = Math.abs(movie.avgRating - likedMovie.avgRating);
      similarity += (1 - ratingDiff / 5) * 0.1;
    }

    totalSimilarity += similarity;
    count++;
  }

  return count > 0 ? totalSimilarity / count : 0.5;
}

// Collaborative filtering: find similar users and their preferences
async function calculateCollaborativeScore(
  ctx: any,
  movie: Doc<"movies">,
  userId: Id<"users">,
  userRatings: Doc<"ratings">[],
): Promise<number> {
  if (userRatings.length < 3) return 0.5; // need sufficient data

  // Get all ratings for movies this user has rated
  const userMovieIds = userRatings.map((r) => r.movieId);

  // Find users who rated the same movies
  const otherUsersRatings = await ctx.db
    .query("ratings")
    .filter((q: any) => q.neq(q.field("userId"), userId))
    .collect();

  // Group by user
  const userSimilarities = new Map<Id<"users">, number>();

  for (const rating of otherUsersRatings) {
    if (!userMovieIds.includes(rating.movieId)) continue;

    const userRating = userRatings.find((r) => r.movieId === rating.movieId);
    if (!userRating) continue;

    // Calculate rating similarity
    const ratingDiff = Math.abs(
      userRating.overallRating - rating.overallRating,
    );
    const similarity = 1 - ratingDiff / 5;

    const currentSim = userSimilarities.get(rating.userId) || 0;
    userSimilarities.set(rating.userId, currentSim + similarity);
  }

  // Find similar users (top 30% similarity)
  const similarUsers = Array.from(userSimilarities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(10, Math.floor(userSimilarities.size * 0.3)))
    .map((entry) => entry[0]);

  if (similarUsers.length === 0) return 0.5;

  // Check if similar users liked this movie
  const similarUsersRatingsForMovie = otherUsersRatings.filter(
    (r: any) => r.movieId === movie._id && similarUsers.includes(r.userId),
  );

  if (similarUsersRatingsForMovie.length === 0) return 0.5;

  // Average rating from similar users
  const avgRating =
    similarUsersRatingsForMovie.reduce(
      (sum: any, r: any) => sum + r.overallRating,
      0,
    ) / similarUsersRatingsForMovie.length;

  return avgRating / 5; // normalize to 0-1
}

// Trending score based on recent popularity
function calculateTrendingScore(movie: Doc<"movies">): number {
  if (!movie.trending) return 0.3;

  const trendingScore = movie.trendingScore || 0;
  const views = movie.views || 0;
  const reviews = movie.reviews || 0;

  // Combine trending indicators
  return Math.min(
    1,
    trendingScore * 0.4 +
      Math.min(views / 1000, 1) * 0.3 +
      Math.min(reviews / 100, 1) * 0.3,
  );
}

// Diversity bonus: encourage exploration
function calculateDiversityBonus(
  movie: Doc<"movies">,
  userRatings: Doc<"ratings">[],
  allMovies: Doc<"movies">[],
  user: Doc<"users">,
): number {
  // Get user's adventurous score
  const adventurousness = user.personalityProfile?.adventurous || 0.5;

  if (adventurousness < 0.3) return 0; // conservative users don't get diversity bonus

  // Check if movie is from a new genre
  const userMovies = userRatings
    .map((r) => allMovies.find((m) => m._id === r.movieId))
    .filter((m) => m !== undefined) as Doc<"movies">[];

  const userGenres = new Set(userMovies.flatMap((m) => m.genres || []));

  const movieGenres = movie.genres || [];
  const newGenres = movieGenres.filter((g) => !userGenres.has(g));

  if (newGenres.length === 0) return 0;

  // Higher bonus for more adventurous users
  return (newGenres.length / movieGenres.length) * adventurousness;
}

// Determine recommendation type based on scores
function determineRecommendationType(
  contentScore: number,
  collaborativeScore: number,
  trendingScore: number,
  diversityBonus: number,
  movie: Doc<"movies">,
): {
  algorithm: "content_based" | "collaborative" | "trending" | "discovery";
  reason: string;
} {
  const scores = [
    {
      score: contentScore,
      type: "content_based" as const,
      reason: "Similar to movies you loved",
    },
    {
      score: collaborativeScore,
      type: "collaborative" as const,
      reason: "Popular with users like you",
    },
    { score: trendingScore, type: "trending" as const, reason: "Trending now" },
    {
      score: diversityBonus,
      type: "discovery" as const,
      reason: "Expand your horizons",
    },
  ];

  const topScore = scores.sort((a, b) => b.score - a.score)[0];

  // Add genre-specific reasons
  if (topScore.type === "content_based" && movie.genres) {
    return {
      algorithm: topScore.type,
      reason: `Matches your ${movie.genres[0]} preferences`,
    };
  }

  return {
    algorithm: topScore.type,
    reason: topScore.reason,
  };
}

// Update user personality profile based on ratings
export const updatePersonalityProfile = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (ratings.length < 3) return; // need sufficient data

    // Calculate adventurous: variety of genres
    const allMovies = await ctx.db.query("movies").collect();
    const ratedMovies = ratings
      .map((r) => allMovies.find((m) => m._id === r.movieId))
      .filter((m) => m !== undefined) as Doc<"movies">[];

    const uniqueGenres = new Set(ratedMovies.flatMap((m) => m.genres || []));
    const adventurous = Math.min(uniqueGenres.size / 15, 1); // normalize to 0-1

    // Calculate critical: tendency to rate harshly
    const avgRating =
      ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length;
    const critical = 1 - avgRating / 5;

    // Calculate social: placeholder (would need social features)
    const social = user.personalityProfile?.social || 0.5;

    // Calculate binge: ratings in short timeframes
    const sortedRatings = ratings.sort((a, b) => a.createdAt - b.createdAt);
    let consecutiveDays = 0;
    let maxStreak = 0;

    for (let i = 1; i < sortedRatings.length; i++) {
      const daysDiff =
        (sortedRatings[i].createdAt - sortedRatings[i - 1].createdAt) /
        (1000 * 60 * 60 * 24);
      if (daysDiff <= 1) {
        consecutiveDays++;
        maxStreak = Math.max(maxStreak, consecutiveDays);
      } else {
        consecutiveDays = 0;
      }
    }

    const binge = Math.min(maxStreak / 7, 1);

    await ctx.db.patch(args.userId, {
      personalityProfile: {
        adventurous,
        critical,
        social,
        binge,
      },
    });
  },
});
