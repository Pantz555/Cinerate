"use client";

import { useQueryWithStatus } from "@/components/ConvexClientProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  const { data: user } = useQueryWithStatus(api.auth.loggedInUser);
  console.log("user from hero section", user);
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5] to-[#3B82F6]" />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Movie Poster Cards */}
      <div className="absolute inset-0 hidden lg:block">
        {/* Avengers Endgame - Top Left */}
        <div
          className="absolute left-[10%] top-[15%] w-[200px] animate-float-slow"
          style={{ transform: "rotate(-15deg)" }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-[-10deg] duration-300">
            <CardContent className="p-3">
              <div
                className="mb-2 aspect-[2/3] rounded "
                style={{
                  backgroundImage: `url("/avenger.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900">
                Avengers: Endgame
              </h4>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inception - Top Right */}
        <div
          className="absolute right-[10%] top-[20%] w-[200px] animate-float-slow"
          style={{ transform: "rotate(10deg)", animationDelay: "2s" }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-[15deg] duration-300">
            <CardContent className="p-3">
              <div
                className="mb-2 aspect-[2/3] rounded "
                style={{
                  backgroundImage: `url("/inception.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900">Inception</h4>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parasite - Bottom Left */}
        <div
          className="absolute bottom-[15%] left-[15%] w-[200px] animate-float-slow"
          style={{ transform: "rotate(-8deg)", animationDelay: "4s" }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-[-3deg] duration-300">
            <CardContent className="p-3">
              <div
                className="mb-2 aspect-[2/3] rounded "
                style={{
                  backgroundImage: `url("/parasite.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900">Parasite</h4>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dune - Bottom Right */}
        <div
          className="absolute bottom-[20%] right-[12%] w-[200px] animate-float-slow"
          style={{ transform: "rotate(12deg)", animationDelay: "6s" }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-[17deg] duration-300">
            <CardContent className="p-3">
              <div
                className="mb-2 aspect-[2/3] rounded "
                style={{
                  backgroundImage: `url("/dune.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900">Dune</h4>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Floating Cards (only 2) */}
      <div className="absolute inset-0 lg:hidden">
        {/* Avengers - Top Left */}
        <div
          className="absolute left-[5%] top-[10%] w-[120px] animate-float-slow transition-all duration-300"
          style={{
            transform: "rotate(-10deg)",
          }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm">
            <CardContent className="p-2">
              <div
                className="mb-1 aspect-[2/3] "
                style={{
                  backgroundImage: `url("/avenger.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-xs font-semibold text-gray-900">Avengers</h4>
            </CardContent>
          </Card>
        </div>

        {/* Dune - Bottom Right */}
        <div
          className="absolute bottom-[15%] right-[5%] w-[120px] animate-float-slow transition-all duration-300"
          style={{
            transform: "rotate(8deg)",
            animationDelay: "3s",
          }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm">
            <CardContent className="p-2">
              <div
                className="mb-1 aspect-[2/3] "
                style={{
                  backgroundImage: `url("/dune.png")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h4 className="text-xs font-semibold text-gray-900">Dune</h4>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          Join 10,000+ movie lovers
        </div>

        <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Rate Movies the Way They Deserve
        </h1>

        <p className="mx-auto mb-12 max-w-2xl font-sans text-lg text-white/90 sm:text-xl">
          Go beyond single stars. Rate acting, plot, cinematography, direction,
          and entertainment—all in one place.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-14 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] px-8 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
            asChild
          >
            <Link href={user && user?._id ? "/discover" : "/auth"}>
              Start Rating for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 border-2 border-white dark:border-white dark:hover:border-white bg-transparent px-8 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#3B82F6] dark:hover:bg-white"
            asChild
          >
            <Link href="#how-it-works">
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
