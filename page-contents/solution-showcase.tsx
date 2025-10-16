"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex-helpers/react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Clapperboard,
  Film,
  Mail,
  Popcorn,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const SolutionShowcase = () => {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRating = useMutation(api.ratings.submitRating);

  const { data, isPending: featuredLoading } = useQueryWithStatus(
    api.movies.getMoviesWithFilters,
    {
      featured: true,
      sortBy: "highest",
    },
  );

  const featuredMovie = data ? data[0] : null;
  const { signIn } = useAuthActions();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);

  // Check if user has existing rating for the featured movie
  const { data: existingRating, isPending: ratingLoading } = useQueryWithStatus(
    api.ratings.getUserRating,
    featuredMovie?._id ? { movieId: featuredMovie._id } : "skip",
  );

  // Load ratings on mount (prioritize existing DB rating over localStorage)
  useEffect(() => {
    if (ratingLoading || featuredLoading) return;

    // If user has existing rating in DB, use that
    if (
      existingRating?.ratings &&
      existingRating.movieId === featuredMovie?._id
    ) {
      setUserRatings(existingRating.ratings);
      return;
    }

    // Otherwise, check localStorage for demo ratings
    const savedRating = localStorage.getItem("demo_rating_inception");
    if (savedRating) {
      try {
        const parsed = JSON.parse(savedRating);
        if (parsed.ratings) {
          setUserRatings(parsed.ratings);

          // Check if we should show prompt based on saved ratings
          const ratedCount = Object.values(parsed.ratings).filter(
            (r: number) => r > 0,
          ).length;
          const hasSeenPrompt = sessionStorage.getItem("demo_prompt_shown");

          // Show prompt if 3+ categories and not logged in and hasn't seen it
          if (ratedCount >= 3 && !hasSeenPrompt && !isAuthenticated?.data) {
            setShowSignUpPrompt(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved rating:", e);
      }
    }
  }, [existingRating, ratingLoading, featuredLoading, isAuthenticated?.data]);

  const categories = [
    {
      id: "acting",
      name: "Acting Performance",
      icon: Clapperboard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Rate the cast's performances separately from the story",
    },
    {
      id: "plot",
      name: "Plot & Story",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Evaluate narrative quality, pacing, and storytelling",
    },
    {
      id: "cinematography",
      name: "Cinematography",
      icon: Camera,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Judge visual composition, lighting, and camera work",
    },
    {
      id: "direction",
      name: "Direction",
      icon: Film,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Assess the director's vision and execution",
    },
    {
      id: "entertainment",
      name: "Entertainment Value",
      icon: Popcorn,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      description: "How enjoyable was the overall experience?",
    },
  ];

  const communityAverage = {
    acting: 4.5,
    plot: 4.2,
    cinematography: 4.8,
    direction: 4.6,
    entertainment: 4.3,
  };

  const calculateOverallRating = () => {
    const values = Object.values(userRatings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return values.length > 0 ? (sum / values.length).toFixed(1) : "0.0";
  };

  const handleRating = (category: string, rating: number) => {
    // Don't allow rating changes if user already has a DB rating
    if (existingRating?.ratings) {
      toast.info(
        "You've already rated this movie! Your existing rating is shown.",
      );
      return;
    }

    setUserRatings((prev) => {
      const newRatings = { ...prev, [category]: rating };

      // Count how many categories have been rated (non-zero)
      const ratedCount = Object.values(newRatings).filter((r) => r > 0).length;

      // Calculate overall score
      const values = Object.values(newRatings);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const overallScore = values.length > 0 ? sum / values.length : 0;

      // Save to localStorage (as per PRD)
      const demoRating = {
        movie: featuredMovie?.title || "Inception",
        movieId: featuredMovie?._id || "inception_id",
        ratings: newRatings,
        overallScore: Number.parseFloat(overallScore.toFixed(1)),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("demo_rating_inception", JSON.stringify(demoRating));

      // Trigger sign-up prompt after 3 categories (Option A from PRD)
      if (
        ratedCount >= 3 &&
        !showSignUpPrompt &&
        !sessionStorage.getItem("demo_prompt_shown")
      ) {
        // 0.5 second delay as per PRD
        setTimeout(() => {
          setShowSignUpPrompt(true);
          sessionStorage.setItem("demo_prompt_shown", "true");

          // Smooth scroll to prompt
          setTimeout(() => {
            document
              .getElementById("signup-prompt")
              ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        }, 500);
      }

      return newRatings;
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store source for analytics
      localStorage.setItem("signup_source", "landing_page_demo");

      // Trigger Convex magic link email
      await signIn("resend", { email });

      toast.success("Check your inbox! We've sent you a magic sign-in link.");
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      toast.error("Oops! Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Store source for analytics
    localStorage.setItem("signup_source", "landing_page_demo");

    console.log("[Demo] Google sign-in clicked");
    console.log(
      "[Demo] Saved ratings:",
      localStorage.getItem("demo_rating_inception"),
    );

    try {
      void signIn("google");
    } catch (error) {
      toast.error("Oops! Something went wrong. Please try again.");
    }
  };

  const handleSaveRating = async () => {
    if (!featuredMovie?._id) {
      toast.error("Movie not found");
      return;
    }

    try {
      await submitRating({
        movieId: featuredMovie._id,
        ratings: userRatings,
        review: undefined,
        isPublicReview: false,
      });

      // PRD: Success feedback
      toast.success("Rating submitted successfully!");

      // PRD: Clear demo data after successful submission
      localStorage.removeItem("demo_rating_inception");
      sessionStorage.removeItem("demo_prompt_shown");
      localStorage.removeItem("signup_source");

      // PRD: Redirect after submission
      router.push(`/movie/${featuredMovie._id}/rate`)
    } catch (error) {
      console.error("Failed to submit rating:", error);
      // PRD: Error message format
      toast.error("Oops! Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (featuredLoading || ratingLoading) {
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-4 h-8 w-80 rounded-lg" />
            <Skeleton className="mx-auto h-5 w-96 rounded-lg" />
          </div>

          {/* Try It Yourself Card Skeleton */}
          <div className="mx-auto mb-6 max-w-4xl border-2 rounded-xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Skeleton className="mb-2 h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-56 rounded-lg" />
              </div>
              <div className="text-right">
                <Skeleton className="mb-2 h-10 w-16 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
            </div>

            {/* Category skeletons */}
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-lg border-2 border-border p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-40 rounded-lg" />
                      <Skeleton className="h-3 w-64 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-8 w-8 rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-28 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights Skeleton */}
          <div className="grid gap-6 md:grid-cols-5 mt-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-6 text-center"
              >
                <Skeleton className="mx-auto mb-3 h-10 w-10 rounded-lg" />
                <Skeleton className="mx-auto mb-2 h-4 w-32 rounded-lg" />
                <Skeleton className="mx-auto h-3 w-40 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredMovie) {
    return (
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Introducing Multi-Dimensional Movie Ratings
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              No featured movie available at the moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  const totalRatings = Object.values(userRatings).reduce((a, b) => a + b, 0);
  const hasRatings = totalRatings > 0;

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Introducing Multi-Dimensional Movie Ratings
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Rate every aspect of a movie separately and get a complete picture
            of its quality
          </p>
        </div>

        {/* Interactive Demo */}
        <Card className="mx-auto mb-6 max-w-4xl border-2 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Try It Yourself
                </h3>
                <p className="text-sm text-muted-foreground">
                  Rate {featuredMovie.title} across 5 categories
                  {existingRating && " (Your existing rating)"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {calculateOverallRating()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {categories.map((category) => {
                const Icon = category.icon;
                const rating =
                  userRatings[category.id as keyof typeof userRatings];
                const isActive = activeCategory === category.id;

                return (
                  <div
                    key={category.id}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      isActive ? "border-primary bg-primary/5" : "border-border"
                    } ${existingRating ? "opacity-75" : ""}`}
                    onMouseEnter={() => setActiveCategory(category.id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`rounded-lg ${category.bgColor} p-2`}>
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {category.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(category.id, star)}
                            className={`transition-transform ${!existingRating && "hover:scale-110"}`}
                            disabled={!!existingRating}
                          >
                            <Star
                              className={`h-8 w-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/70"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Community:{" "}
                        {
                          communityAverage[
                            category.id as keyof typeof communityAverage
                          ]
                        }
                        /5
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sign-up Prompt - Inline expansion below demo (as per PRD) */}
        {showSignUpPrompt && !existingRating && (
          <div
            id="signup-prompt"
            className="mx-auto mb-12 max-w-4xl animate-in slide-in-from-top-4 fade-in duration-400"
          >
            {isAuthenticated?.data ? (
              // Logged-in user prompt (Edge case from PRD)
              <Card className="border-2 border-[#1E40AF] bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                    <Sparkles className="h-6 w-6 text-[#1E40AF]" />
                    Want to submit this rating to your profile?
                  </h3>
                  <p className="mb-6 text-base text-muted-foreground">
                    Save your rating for {featuredMovie.title} and add it to
                    your movie collection.
                  </p>

                  <Button
                    size="lg"
                    className="h-12 w-full max-w-md bg-[#1E40AF] hover:scale-105 hover:bg-[#1E40AF]/90 transition-transform"
                    onClick={handleSaveRating}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Save to My Ratings
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Non-logged-in user prompt (Main flow from PRD)
              <Card className="border-2 border-[#1E40AF] bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                    <Sparkles className="h-6 w-6 text-[#1E40AF]" />
                    Great taste! Want to save this rating?
                  </h3>
                  <p className="mb-6 text-base text-muted-foreground">
                    Sign up to save your rating for {featuredMovie.title} and
                    get personalized movie recommendations.
                  </p>

                  <form
                    onSubmit={handleEmailSignUp}
                    className="mx-auto mb-4 max-w-md"
                  >
                    <div className="mb-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="📧 Enter your email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError("");
                          }}
                          className="h-12 border-2 border-[#334155] pl-10 focus:border-[#1E40AF]"
                          disabled={isSubmitting}
                        />
                      </div>
                      {emailError && (
                        <p className="mt-2 text-left text-sm text-red-500">
                          {emailError}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="mb-3 h-12 w-full rounded-lg bg-[#1E40AF] hover:scale-105 hover:bg-[#1E40AF]/90 transition-transform shadow-md text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Creating account..."
                        : "Get Started Free"}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>

                  <Button
                    variant="outline"
                    size="lg"
                    className="mb-6 h-12 w-full max-w-md border border-[#E5E7EB] bg-white text-gray-700 dark:text-white hover:bg-gray-50"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <Image
                      src="/google.png"
                      width={20}
                      height={20}
                      className="mr-2 h-5 w-5 shrink-0"
                      alt="google icon"
                    />
                    Continue with Google
                  </Button>

                  {/* Trust indicators as per PRD */}
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#9CA3AF]">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-green-500" />
                      No credit card required
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-green-500" />
                      Free forever
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!existingRating && isAuthenticated.data && hasRatings && (
          <Card className="border-2 border-[#1E40AF] bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg mx-auto mb-12 max-w-4xl animate-in slide-in-from-top-4 fade-in duration-400">
            <CardContent className="p-8 text-center">
              <h3 className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                <Sparkles className="h-6 w-6 text-[#1E40AF]" />
                Want to submit this rating to your profile?
              </h3>
              <p className="mb-6 text-base text-muted-foreground">
                Save your rating for {featuredMovie.title} and add it to your
                movie collection.
              </p>

              <Button
                size="lg"
                className="h-12 w-full max-w-md bg-[#1E40AF] hover:scale-105 hover:bg-[#1E40AF]/90 transition-transform"
                onClick={handleSaveRating}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Save to My Ratings
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        <div className="grid gap-6 md:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="text-center">
                <CardContent className="p-6">
                  <div
                    className={`mb-3 inline-flex rounded-lg ${category.bgColor} p-3`}
                  >
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h4 className="mb-2 font-semibold text-foreground">
                    {category.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionShowcase;
