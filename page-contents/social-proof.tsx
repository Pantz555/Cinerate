"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import React, { useEffect, useState } from "react";

const SocialProof = () => {
  const [statsCount, setStatsCount] = useState({
    users: 0,
    ratings: 0,
    movies: 0,
    satisfaction: 0,
  });

  // Animated counter for statistics
  useEffect(() => {
    const targets = {
      users: 10000,
      ratings: 500000,
      movies: 25000,
      satisfaction: 4.8,
    };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStatsCount({
        users: Math.floor(targets.users * progress),
        ratings: Math.floor(targets.ratings * progress),
        movies: Math.floor(targets.movies * progress),
        satisfaction: Number((targets.satisfaction * progress).toFixed(1)),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStatsCount(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground sm:text-4xl">
          Join a Community of Passionate Movie Lovers
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
          Thousands of users trust CineRate for their movie ratings
        </p>

        {/* Statistics */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {statsCount.users.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {statsCount.ratings.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">
                Ratings Submitted
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {statsCount.movies.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Movies Rated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {statsCount.satisfaction}/5
              </div>
              <div className="text-sm text-muted-foreground">
                User Satisfaction
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <Quote className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-4 text-muted-foreground">
                "Finally, a platform that understands movies are more than just
                'good' or 'bad'. I can rate the cinematography separately from
                the plot!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                <div>
                  <div className="font-semibold text-foreground">Sarah M.</div>
                  <div className="text-sm text-muted-foreground">
                    Film Student
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Quote className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-4 text-muted-foreground">
                "I used to spend hours reading reviews. Now I just check the
                category breakdowns and know exactly what to expect."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600" />
                <div>
                  <div className="font-semibold text-foreground">James T.</div>
                  <div className="text-sm text-muted-foreground">
                    Movie Enthusiast
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Quote className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-4 text-muted-foreground">
                "The recommendations are spot-on. It learned I love great acting
                even if the plot is weak, and now I discover hidden gems."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600" />
                <div>
                  <div className="font-semibold text-foreground">Maria L.</div>
                  <div className="text-sm text-muted-foreground">
                    Casual Viewer
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
