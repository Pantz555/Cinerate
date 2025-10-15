import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import React from "react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-muted/50 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground sm:text-4xl">
          Start Rating in 3 Simple Steps
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
          Join thousands of movie lovers in minutes
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">
              Discover Movies
            </h3>
            <p className="mb-4 text-muted-foreground">
              Search our database of 25,000+ movies or explore trending picks
            </p>
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                <div className="rounded-lg bg-background/90 p-3 backdrop-blur">
                  <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-[2/3] rounded bg-muted" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="relative">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">
              Rate Across 5 Categories
            </h3>
            <p className="mb-4 text-muted-foreground">
              Give each aspect of the movie the score it deserves
            </p>
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 p-4">
                <div className="space-y-2 rounded-lg bg-background/90 p-3 backdrop-blur">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="h-3 w-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="relative">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">
              Get Personalized Recommendations
            </h3>
            <p className="mb-4 text-muted-foreground">
              Our algorithm learns your taste and suggests movies you'll love
            </p>
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-500 to-pink-600 p-4">
                <div className="rounded-lg bg-background/90 p-3 backdrop-blur">
                  <div className="mb-2 h-4 w-32 rounded bg-muted" />
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-[2/3] rounded bg-muted" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
