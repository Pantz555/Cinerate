"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Camera,
  Clapperboard,
  Film,
  Popcorn,
  Star,
} from "lucide-react";
import React, { useState } from "react";

const SolutionShowcase = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState({
    acting: 0,
    plot: 0,
    cinematography: 0,
    direction: 0,
    entertainment: 0,
  });
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
    setUserRatings((prev) => ({ ...prev, [category]: rating }));
  };
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
        <Card className="mx-auto mb-12 max-w-4xl border-2 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Try It Yourself
                </h3>
                <p className="text-sm text-muted-foreground">
                  Rate Inception across 5 categories
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
                    }`}
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
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(category.id, star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-400"}`}
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
