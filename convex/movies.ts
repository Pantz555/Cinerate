import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

export const createMovie = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    genre: v.optional(v.string()),
    genres: v.array(v.string()),
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
    trending: v.optional(v.boolean()),
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
          genres: args.genres,
          year: args.year,
          director: args.director,
          cast: args.cast,
          trailer: args.trailer,
          duration: args.duration,
          status: args.status,
          rating: args.rating,
          posterUrl: posterUrl ? posterUrl : undefined,
          featured: args.featured,
          trending: args.trending,
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
          genre: args.genres.join(" "),
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
    genres: v.optional(v.array(v.string())),
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
    trending: v.optional(v.boolean()),
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

      // Remove undefined values and add timestamp
      const cleanedData = Object.fromEntries(
        Object.entries({ ...updateData, posterUrl }).filter(([, value]) => {
          return value !== undefined;
        }),
      );

      // if (
      //   args.description &&
      //   args.title &&
      //   args.cast &&
      //   args.genres &&
      //   args.year &&
      //   args.id
      // ) {
      //   await ctx.scheduler.runAfter(0, api.rag.addMovieEmbeddings, {
      //     content: args.description,
      //     title: args.title,
      //     movieId: args.id,
      //     posterUrl: posterUrl || undefined,
      //     cast: args.cast,
      //     genre: args.genres.join(" "),
      //     year: args.year,
      //   });
      // }

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

      // delete movie embeddings
      // await ctx.scheduler.runAfter(0, api.rag.removeMovieEmbeddings, {
      //   movieId: args.id,
      // });

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
      genres: movie.genres,
      year: movie.year,
      totalRatings: movie.totalRatings,
      description: movie.description,
      duration: movie.duration,
      avgRating: movie.avgRating,
      reviews: movie.reviews,
    };
  },
});

export const listMovies = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getHiddenGems = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginated = await ctx.db
      .query("movies")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.gte(q.field("avgRating"), 4), // highly rated
          q.lt(q.field("reviews"), 50), // fewer reviews
        ),
      )
      .order("desc") // sort by rating
      .paginate(args.paginationOpts);

    return {
      page: paginated.page,
      isDone: paginated.isDone,
      continueCursor: paginated.continueCursor,
      splitCursor: paginated.splitCursor,
    };
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

export const getMoviesWithFiltersPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
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
  },
  handler: async (ctx, args) => {
    const {
      paginationOpts,
      genre,
      year,
      minRating,
      status,
      sortBy = "popularity",
    } = args;

    let baseQuery;

    if (sortBy === "highest" && minRating !== undefined) {
      baseQuery = ctx.db
        .query("movies")
        .withIndex("by_rating", (q) => q.gte("avgRating", minRating))
        .order("desc");
    } else if (sortBy === "recent" && year) {
      baseQuery = ctx.db
        .query("movies")
        .withIndex("by_year", (q) => q.eq("year", year))
        .order("desc");
    } else if (sortBy === "trending") {
      baseQuery = ctx.db
        .query("movies")
        .withIndex("by_trending", (q) => q.eq("trending", true))
        .order("desc");
    } else {
      // Default: full table scan by creation time
      baseQuery = ctx.db.query("movies").order("desc");
    }

    // The status filter is always a safe and fast filter to apply
    baseQuery = baseQuery.filter((q) =>
      q.eq(q.field("status"), status || "published"),
    );

    // Only apply remaining scalar filters if they weren't used for the index
    if (year && sortBy !== "recent") {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("year"), year));
    }
    if (minRating !== undefined && sortBy !== "highest") {
      baseQuery = baseQuery.filter((q) =>
        q.gte(q.field("avgRating"), minRating),
      );
    }

    // Check if the genre filter is active
    if (genre) {
      // If genre is active, collect ALL results from the baseQuery first
      const allMovies = await baseQuery.collect();

      const filterGenreLower = genre.toLowerCase();
      let moviesPage = allMovies.filter((movie) => {
        if (!movie.genres || movie.genres.length === 0) {
          return false;
        }
        return movie.genres.some(
          (movieGenre) => movieGenre.toLowerCase() === filterGenreLower,
        );
      });

      if (
        sortBy === "recent" ||
        sortBy === "highest" ||
        sortBy === "trending"
      ) {
        moviesPage.sort((a, b) => b._creationTime - a._creationTime);
      }

      // Apply popularity sort in-memory (if requested)
      if (sortBy === "popularity") {
        moviesPage.sort(
          (a, b) => calculatePopularityScore(b) - calculatePopularityScore(a),
        );
      }

      // Apply pagination limit manually (since we used .collect() instead of .paginate())
      const { numItems, cursor } = paginationOpts;
      const startIndex = cursor
        ? moviesPage.findIndex((m) => m._id === cursor) + 1
        : 0;
      const page = moviesPage.slice(startIndex, startIndex + numItems);
      const hasNextPage = moviesPage.length > startIndex + numItems;

      // Manually construct the pagination result object
      return {
        page,
        continueCursor: hasNextPage ? page[page.length - 1]?._id : null,
        isDone: !hasNextPage,
      };
    }

    const paginatedResults = await baseQuery.paginate(paginationOpts);

    // For popularity sorting, we need to calculate scores on the paginated page
    if (sortBy === "popularity") {
      const moviesPage = paginatedResults.page;
      const sortedMovies = [...moviesPage].sort((a, b) => {
        const scoreA = calculatePopularityScore(a);
        const scoreB = calculatePopularityScore(b);
        return scoreB - scoreA;
      });
      return {
        ...paginatedResults,
        page: sortedMovies,
      };
    }

    return {
      page: paginatedResults.page,
      continueCursor: paginatedResults.continueCursor,
      isDone: paginatedResults.isDone,
    };
  },
});

// Helper function to calculate popularity score
function calculatePopularityScore(movie: any): number {
  const rating = movie.avgRating || movie.rating || 0;
  const reviews = movie.reviews || 0;
  const views = movie.views || 0;
  return rating * 100 + reviews * 10 + views * 0.5;
}

// Helper function to calculate trending score
function calculateTrendingScore(movie: any): number {
  const rating = movie.avgRating || movie.rating || 0;
  const reviews = movie.reviews || 0;
  const views = movie.views || 0;
  const isTrending = movie.trending ? 1.5 : 1;
  const baseScore = movie.trendingScore || 0;

  const calculatedScore =
    (rating * 10 + reviews * 2 + views * 0.1 + baseScore * 5) * isTrending;

  return calculatedScore;
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
      .withIndex("by_trending", (q) => q.eq("trending", true))
      .order("desc")
      .take(limit);

    return movies;
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

// Get personalized movie recommendations based on user's rating history
export const getPersonalizedPicks = query({
  args: {
    paginationOpts: paginationOptsValidator,
    minRating: v.optional(v.number()), // Minimum rating threshold for "liked" movies
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        splitCursor: undefined,
        bytesRead: 0,
      };
    }

    const minRating = args.minRating || 4;

    // Get user's highly rated movies
    const userRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("overallRating"), minRating))
      .collect();

    let baseMoviesQuery = ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("status"), "published"));

    if (userRatings.length > 0) {
      // Get the movies user rated highly
      const likedMovies = await Promise.all(
        userRatings.map((rating) => ctx.db.get(rating.movieId)),
      );
      const validLikedMovies = likedMovies.filter((m) => m !== null);

      const preferredGenres = new Map<string, number>();
      const preferredDirectors = new Map<string, number>();
      const preferredYears = new Map<string, number>();

      validLikedMovies.forEach((movie) => {
        if (movie.genre) {
          preferredGenres.set(
            movie.genre,
            (preferredGenres.get(movie.genre) || 0) + 1,
          );
        }
        if (movie.director) {
          preferredDirectors.set(
            movie.director,
            (preferredDirectors.get(movie.director) || 0) + 1,
          );
        }
        if (movie.year) {
          preferredYears.set(
            movie.year,
            (preferredYears.get(movie.year) || 0) + 1,
          );
        }
      });

      // Exclude movies already rated
      const ratedMovieIds = new Set(userRatings.map((r) => r.movieId));
      baseMoviesQuery = baseMoviesQuery.filter((q) =>
        q.not(
          q.or(
            ...Array.from(ratedMovieIds).map((id) => q.eq(q.field("_id"), id)),
          ),
        ),
      );
    }

    // Apply pagination
    const paginated = await baseMoviesQuery
      .order("desc")
      .paginate(args.paginationOpts);

    // Compute personalized scores for the current page
    const scoredMovies = paginated.page.map((movie) => {
      let score = 0;
      let matchReasons: string[] = [];

      // scoring logic like before...
      if (movie.avgRating) {
        score += (movie.avgRating / 5) * 10;
      }

      return {
        ...movie,
        personalizedScore: score,
        matchReasons:
          matchReasons.length > 0 ? matchReasons : ["Similar to your taste"],
        matchPercentage: Math.min(Math.round(score * 2), 99),
      };
    });

    return {
      ...paginated,
      page: scoredMovies,
    };
  },
});

// Get user's rating patterns for better recommendations
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const userRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (userRatings.length === 0) {
      return null;
    }

    // Get rated movies
    const ratedMovies = await Promise.all(
      userRatings.map(async (rating) => {
        const movie = await ctx.db.get(rating.movieId);
        return movie ? { ...movie, userRating: rating.overallRating } : null;
      }),
    );

    const validRatedMovies = ratedMovies.filter((movie) => movie !== null);

    // Analyze preferences
    const genrePreferences = new Map<
      string,
      { count: number; avgRating: number }
    >();
    const directorPreferences = new Map<
      string,
      { count: number; avgRating: number }
    >();

    validRatedMovies.forEach((movie) => {
      if (movie.genre) {
        const current = genrePreferences.get(movie.genre) || {
          count: 0,
          avgRating: 0,
        };
        genrePreferences.set(movie.genre, {
          count: current.count + 1,
          avgRating:
            (current.avgRating * current.count + movie.userRating) /
            (current.count + 1),
        });
      }

      if (movie.director) {
        const current = directorPreferences.get(movie.director) || {
          count: 0,
          avgRating: 0,
        };
        directorPreferences.set(movie.director, {
          count: current.count + 1,
          avgRating:
            (current.avgRating * current.count + movie.userRating) /
            (current.count + 1),
        });
      }
    });

    return {
      totalRatings: userRatings.length,
      averageRating:
        userRatings.reduce((sum, r) => sum + r.overallRating, 0) /
        userRatings.length,
      favoriteGenres: Array.from(genrePreferences.entries())
        .sort((a, b) => b[1].avgRating - a[1].avgRating)
        .slice(0, 3)
        .map(([genre, data]) => ({ genre, ...data })),
      favoriteDirectors: Array.from(directorPreferences.entries())
        .sort((a, b) => b[1].avgRating - a[1].avgRating)
        .slice(0, 3)
        .map(([director, data]) => ({ director, ...data })),
    };
  },
});

// Get movies similar to a specific movie the user liked
export const getSimilarMovies = query({
  args: {
    movieId: v.id("movies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const targetMovie = await ctx.db.get(args.movieId);
    if (!targetMovie) {
      return [];
    }

    // Find movies with similar attributes
    const allMovies = await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    const similarMovies = allMovies
      .filter((movie) => movie._id !== args.movieId)
      .map((movie) => {
        let similarityScore = 0;
        let reasons = [];

        // Same genre
        if (movie.genre === targetMovie.genre) {
          similarityScore += 40;
          reasons.push(`Same genre: ${movie.genre}`);
        }

        // Same director
        if (movie.director === targetMovie.director) {
          similarityScore += 30;
          reasons.push(`Same director: ${movie.director}`);
        }

        // Similar year (within 5 years)
        const yearDiff = Math.abs(
          parseInt(movie.year) - parseInt(targetMovie.year),
        );
        if (yearDiff <= 5) {
          similarityScore += Math.max(0, 20 - yearDiff * 2);
          reasons.push(`Similar era`);
        }

        // Similar rating
        if (movie.avgRating && targetMovie.avgRating) {
          const ratingDiff = Math.abs(movie.avgRating - targetMovie.avgRating);
          if (ratingDiff <= 1) {
            similarityScore += Math.max(0, 10 - ratingDiff * 5);
            reasons.push(`Similar rating`);
          }
        }

        return {
          ...movie,
          similarityScore,
          similarityReasons: reasons,
        };
      })
      .filter((movie) => movie.similarityScore > 20) // Only show reasonably similar movies
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return similarMovies;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const migrateGenresToArray = mutation({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();
    for (const movie of movies) {
      const genres = movie.genre
        ? movie.genre.split(",").map((g) => g.trim())
        : [];
      await ctx.db.patch(movie._id, {
        genres,
        genre: undefined, // Optionally remove the old genre field
      });
    }
    return { message: `Migrated ${movies.length} movies to use genres array` };
  },
});
