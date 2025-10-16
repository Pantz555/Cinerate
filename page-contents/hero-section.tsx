"use client";

import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import React from "react";
import MovieCardPreview from "./movie-card-preview";

const HeroSection = () => {
  const { data: isAuthenticated, isPending } = useQueryWithStatus(
    api.auth.isAuthenticated,
  );
  const { data, isPending: featuredLoading } = useQueryWithStatus(
    api.movies.getMoviesWithFilters,
    {
      featured: true,
      sortBy: "highest",
    },
  );

  const featuredMovie = data ? data[0] : null;
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Join 10,000+ movie lovers
        </div>

        <h1 className="text-3xl leading-[1.29167] font-bold text-balance sm:text-4xl lg:text-6xl mb-10">
          Rate Movies the Way
          <br />
          <span className="relative">
            Effortless
            <svg
              width="223"
              height="12"
              viewBox="0 0 223 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-x-0 bottom-0 w-full translate-y-1/2 max-sm:hidden"
            >
              <path
                d="M1.11716 10.428C39.7835 4.97282 75.9074 2.70494 114.894 1.98894C143.706 1.45983 175.684 0.313587 204.212 3.31596C209.925 3.60546 215.144 4.59884 221.535 5.74551"
                stroke="url(#paint0_linear_10365_68643)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_10365_68643"
                  x1="18.8541"
                  y1="3.72033"
                  x2="42.6487"
                  y2="66.6308"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--primary)" />
                  <stop offset="1" stopColor="var(--primary-foreground)" />
                </linearGradient>
              </defs>
            </svg>
          </span>{" "}
          They Deserve
        </h1>
        {/* <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">
          Rate Movies the Way
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            They Deserve
          </span>
        </h1> */}

        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Go beyond single stars. Rate acting, plot, cinematography, direction,
          and entertainment—all in one place.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="h-14 px-8 text-lg text-white" asChild>
            <Link href={isAuthenticated ? "/discover" : "/auth"}>
              Start Rating for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg bg-transparent"
            asChild
          >
            <Link href="#how-it-works">
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Link>
          </Button>
        </div>

        {/* Animated Movie Card Preview */}
        {featuredLoading ? (
          <MovieRatingCardSkeleton />
        ) : featuredMovie ? (
          <MovieCardPreview featuredMovie={featuredMovie} />
        ) : (
          <p className="text-center">No movie found at this moment.</p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

const MovieRatingCardSkeleton = () => {
  return (
    <div className="mt-16">
      <Card className="mx-auto max-w-md border-2 shadow-2xl">
        <CardContent className="p-6 animate-pulse">
          <div className="mb-4 flex items-center gap-3">
            {/* Movie Poster */}
            <Skeleton className="h-16 w-12 rounded bg-muted" />

            {/* Movie Info */}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-3 w-20 bg-muted" />
            </div>
          </div>

          {/* Rating categories */}
          <div className="space-y-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 bg-muted" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4 rounded-sm bg-muted" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
