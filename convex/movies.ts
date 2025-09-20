import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";

export const createMovie = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    year: v.string(),
    director: v.string(),
    cast: v.string(),
    trailer: v.optional(v.string()),
    duration: v.optional(v.string()),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("archived"),
    ),
    rating: v.number(),
    featured: v.optional(v.boolean()),
    posterUrl: v.optional(v.string()),
    posterFileId: v.id("_storage"), // reference to Convex storage
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const posterUrl = await ctx.storage.getUrl(args.posterFileId);
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "admin") {
        throw new ConvexError("Access denied");
      } else {
        const movieId = await ctx.db.insert("movies", {
          title: args.title,
          description: args.description,
          genre: args.genre,
          year: args.year,
          director: args.director,
          cast: args.cast,
          trailer: args.trailer,
          duration: args.duration,
          status: args.status,
          rating: args.rating,
          posterUrl: posterUrl ? posterUrl : undefined,
          featured: args.featured,
          views: 0,
          reviews: 0,
          updatedAt: Date.now(),
        });

        // Track activity
        await ctx.scheduler.runAfter(0, api.activities.createActivity, {
          userId,
          activityType: "movie_created",
          targetId: movieId,
          targetType: "movie",
          metadata: {
            movieTitle: args.title,
            movieId: movieId,
            posterUrl: posterUrl || undefined,
          },
        });

        //add embeddings
        await ctx.scheduler.runAfter(0, api.rag.addMovieEmbeddings, {
          content: args.description,
          title: args.title,
          movieId: movieId,
          posterUrl: posterUrl || undefined,
          cast: args.cast,
          genre: args.genre,
          year: args.year,
        });

        return movieId;
      }
    } else {
      throw new ConvexError("Unauthorized");
    }
  },
});

export const updateMovie = mutation({
  args: {
    id: v.id("movies"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    year: v.optional(v.string()),
    director: v.optional(v.string()),
    cast: v.optional(v.string()),
    trailer: v.optional(v.string()),
    duration: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("published"),
        v.literal("draft"),
        v.literal("archived"),
      ),
    ),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    posterUrl: v.optional(v.string()),
    posterFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "admin") {
        throw new ConvexError("Access denied");
      }

      const existingMovie = await ctx.db.get(args.id);
      if (!existingMovie) {
        throw new ConvexError("Movie not found");
      }

      const { id, posterFileId, ...updateData } = args;

      // If a new poster file is provided, get its URL
      let posterUrl = updateData.posterUrl || null;
      if (posterFileId) {
        posterUrl = await ctx.storage.getUrl(posterFileId);
      }
      console.log("args", args);

      // Remove undefined values and add timestamp
      const cleanedData = Object.fromEntries(
        Object.entries({ ...updateData, posterUrl }).filter(([, value]) => {
          return value !== undefined;
        }),
      );

      // Track activity
      await ctx.scheduler.runAfter(0, api.activities.createActivity, {
        userId,
        activityType: "movie_updated",
        targetId: id,
        targetType: "movie",
        metadata: {
          movieTitle: updateData.title || existingMovie.title,
          movieId: id,
          posterUrl: posterUrl || existingMovie.posterUrl,
        },
      });

      return await ctx.db.patch(id, {
        ...cleanedData,
        updatedAt: Date.now(),
      });
    } else {
      throw new ConvexError("Unauthorized");
    }
  },
});

export const deleteMovie = mutation({
  args: {
    id: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "admin") {
        throw new ConvexError("Access denied");
      }

      // Get the movie to check if it has a poster file to delete
      const movie = await ctx.db.get(args.id);
      if (!movie) {
        throw new ConvexError("Movie not found");
      }

      // Track activity before deletion
      await ctx.scheduler.runAfter(0, api.activities.createActivity, {
        userId,
        activityType: "movie_deleted",
        targetId: args.id,
        targetType: "movie",
        metadata: {
          movieTitle: movie.title,
          movieId: args.id,
          posterUrl: movie.posterUrl,
        },
      });

      // Delete the movie
      await ctx.db.delete(args.id);

      return { success: true };
    } else {
      throw new ConvexError("Unauthorized");
    }
  },
});

export const updateMovieStatus = mutation({
  args: {
    id: v.id("movies"),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("archived"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "admin") {
        throw new ConvexError("Access denied");
      }
      const existingMovie = await ctx.db.get(args.id);
      if (!existingMovie) {
        throw new ConvexError("Movie not found");
      }

      await ctx.db.patch(args.id, {
        status: args.status,
        updatedAt: Date.now(),
      });

      // Track status change activity
      await ctx.scheduler.runAfter(0, api.activities.createActivity, {
        userId,
        activityType: "movie_status_changed",
        targetId: args.id,
        targetType: "movie",
        metadata: {
          movieTitle: existingMovie.title,
          movieId: args.id,
          oldStatus: existingMovie.status,
          newStatus: args.status,
          posterUrl: existingMovie.posterUrl,
        },
      });

      return { success: true };
    } else {
      throw new ConvexError("Unauthorized");
    }
  },
});

export const getMovieById = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      return null;
    }
    return {
      title: movie.title,
      posterUrl: movie.posterUrl,
      genre: movie.genre,
      year: movie.year,
      description: movie.description,
      duration: movie.duration,
      avgRating: movie.avgRating,
      reviews: movie.reviews,
    };
  },
});

export const listMovies = query({
  handler: async (ctx) => {
    return await ctx.db.query("movies").order("desc").collect();
  },
});

export const getMoviesWithFilters = query({
  args: {
    searchQuery: v.optional(v.string()),
    genre: v.optional(v.string()),
    year: v.optional(v.string()),
    minRating: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("published"),
        v.literal("draft"),
        v.literal("archived"),
      ),
    ),
    sortBy: v.optional(
      v.union(
        v.literal("popularity"),
        v.literal("recent"),
        v.literal("highest"),
        v.literal("trending"),
      ),
    ),
    featured: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Always start with only published movies
    let query = ctx.db
      .query("movies")
      .order("desc")
      .filter((q) => q.eq(q.field("status"), "published"));

    // Get all published movies first
    let movies = await query.collect();

    // Allow overriding if explicit status is passed
    if (args.status && args.status !== "published") {
      movies = await ctx.db
        .query("movies")
        .filter((q) => q.eq(q.field("status"), args.status))
        .collect();
    }

    // Featured movies
    if (args.featured) {
      movies = movies.filter((m) => m.featured === true);
    }

    // New releases (filter by updatedAt, e.g., last 30 days)
    if (args.isNew) {
      const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
      const now = Date.now();
      movies = movies.filter((m) => now - m.updatedAt <= THIRTY_DAYS);
    }

    // Apply filters
    if (args.genre) {
      const genre = args.genre.toLowerCase();
      movies = movies.filter((movie) =>
        movie.genre.toLowerCase().includes(genre),
      );
    }

    if (args.year) {
      movies = movies.filter((movie) => movie.year === args.year);
    }

    if (args.minRating !== undefined) {
      movies = movies.filter(
        (movie) => (movie.avgRating ?? movie.rating ?? 0) >= args.minRating!,
      );
    }

    if (args.searchQuery) {
    }

    // Apply sorting
    switch (args.sortBy) {
      case "recent":
        movies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        break;
      case "highest":
        movies.sort(
          (a, b) =>
            (b.avgRating ?? b.rating ?? 0) - (a.avgRating ?? a.rating ?? 0),
        );
        break;
      case "trending": {
        type MovieWithTrending = (typeof movies)[number] & {
          calculatedTrendingScore: number;
        };
        const moviesWithTrending: MovieWithTrending[] = movies.map((movie) => ({
          ...movie,
          calculatedTrendingScore: calculateTrendingScore(movie),
        }));
        moviesWithTrending.sort(
          (a, b) => b.calculatedTrendingScore - a.calculatedTrendingScore,
        );
        movies = moviesWithTrending;
        break;
      }
      case "popularity":
      default:
        movies.sort((a, b) => {
          const scoreA = calculatePopularityScore(a);
          const scoreB = calculatePopularityScore(b);
          return scoreB - scoreA;
        });
        break;
    }

    return movies.slice(0, 10);
  },
});

export const getHiddenGems = query({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db
      .query("movies")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.gte(q.field("avgRating"), 4), // highly rated
          q.lt(q.field("reviews"), 50), // fewer reviews
        ),
      )
      .order("desc")
      .take(10); // sort by rating

    return movies;
  },
});

export const getMoviesByIds = query({
  args: {
    movieIds: v.array(v.id("movies")),
  },
  handler: async (ctx, args): Promise<any> => {
    const arr: any = [];

    args.movieIds.forEach(async (id) => {
      const movie = await ctx.db.get(id);
      arr.push(movie);
    });

    return arr;
  },
});

// Helper function to calculate trending score
function calculateTrendingScore(movie: any): number {
  const rating = movie.avgRating || movie.rating || 0;
  const reviews = movie.reviews || 0;
  const views = movie.views || 0;
  const isTrending = movie.trending ? 1.5 : 1; // Boost if manually marked as trending
  const baseScore = movie.trendingScore || 0;

  // Weighted formula for trending
  // Higher weight on recent activity (reviews) and manual trending flag
  const calculatedScore =
    (rating * 10 + // Rating impact (0-50)
      reviews * 2 + // Reviews have high impact
      views * 0.1 + // Views have lower impact
      baseScore * 5) * // Manual trending score
    isTrending; // Multiply by trending boost

  return calculatedScore;
}

// Helper function to calculate popularity score
function calculatePopularityScore(movie: any): number {
  const rating = movie.avgRating || movie.rating || 0;
  const reviews = movie.reviews || 0;
  const views = movie.views || 0;

  // Weighted formula: rating is most important, then reviews, then views
  return rating * 100 + reviews * 10 + views * 0.5;
}

// Query specifically for trending movies
export const getTrendingMovies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all published movies
    let movies = await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Calculate trending scores and sort
    movies = movies.map((movie) => ({
      ...movie,
      calculatedTrendingScore: calculateTrendingScore(movie),
    }));

    // Sort by trending score and return top N
    movies.sort(
      (a, b) => calculateTrendingScore(b) - calculateTrendingScore(a),
    );

    return movies.slice(0, limit);
  },
});

// Query for recently rated movies (based on recent rating activities)
export const getRecentlyRatedMovies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    // Get recent ratings
    const recentRatings = await ctx.db
      .query("ratings")
      .order("desc")
      .take(limit * 2); // Get more to ensure unique movies

    // Get unique movie IDs
    const movieIds = new Set<string>();
    const uniqueMovieIds: string[] = [];

    for (const rating of recentRatings) {
      if (!movieIds.has(rating.movieId)) {
        movieIds.add(rating.movieId);
        uniqueMovieIds.push(rating.movieId);
        if (uniqueMovieIds.length >= limit) break;
      }
    }

    // Fetch the movies
    const movies = await Promise.all(
      uniqueMovieIds.map((id) => ctx.db.get(id as any)),
    );

    return movies.filter((movie: any) => movie && movie.status === "published");
  },
});

export const getUserRecentlyRatedMovies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []; // Return empty array if user is not authenticated
    }

    const limit = args.limit || 5;

    // Get recent ratings by the user
    const recentRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Get unique movie IDs
    const movieIds = recentRatings.map((rating) => rating.movieId);

    // Fetch the movies
    const movies = await Promise.all(
      movieIds.map(async (movieId) => {
        const movie = await ctx.db.get(movieId);
        if (!movie || movie.status !== "published") {
          return null;
        }
        // Find the user's rating for this movie
        const userRating = recentRatings.find((r) => r.movieId === movieId);
        return {
          ...movie,
          userRating: userRating?.overallRating || null,
          ratedAt: userRating?.updatedAt || userRating?.createdAt,
        };
      }),
    );

    // Filter out null values and sort by ratedAt (descending)
    return movies
      .filter((movie): movie is NonNullable<typeof movie> => movie !== null)
      .sort((a, b) => (b.ratedAt || 0) - (a.ratedAt || 0));
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
