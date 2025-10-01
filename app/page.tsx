import { api } from "@/convex/_generated/api";
import HomePageContent from "@/page-contents/home-content";
import { preloadQuery } from "convex/nextjs";
import React from "react";

const HomePage = async () => {
  const preloadedRatedMovies = await preloadQuery(
    api.movies.getUserRecentlyRatedMovies,
    { limit: 10 },
  );

  const preloadedTrendingMovies = await preloadQuery(
    api.movies.getTrendingMovies,
    { limit: 10 },
  );

  return (
    <>
      <HomePageContent
        recentlyRatedMoviesProp={preloadedRatedMovies}
        preloadedTrendingMovies={preloadedTrendingMovies}
      />
    </>
  );
};

export default HomePage;
