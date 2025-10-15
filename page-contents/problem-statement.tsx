import { Card, CardContent } from "@/components/ui/card";
import { Film, Star, TrendingUp } from "lucide-react";
import React from "react";

const ProblemStatement = () => {
  return (
    <section className="bg-muted/50 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground sm:text-4xl">
          Single-Star Ratings Don't Tell the Whole Story
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
          Traditional rating systems are too simplistic. Here's why they fail:
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <Star className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                Too Simplistic
              </h3>
              <p className="text-muted-foreground">
                A 3-star movie could have amazing cinematography but a weak
                plot. You'd never know.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                Misleading Averages
              </h3>
              <p className="text-muted-foreground">
                When everyone rates differently, a single number hides what
                actually matters to you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <Film className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                No Nuance
              </h3>
              <p className="text-muted-foreground">
                Great acting? Stunning visuals? Boring story? Traditional
                ratings lump it all together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
