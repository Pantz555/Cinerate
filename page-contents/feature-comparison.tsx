import { Card, CardContent } from "@/components/ui/card";
import { Check, Film, Sparkles, Star, X } from "lucide-react";
import React from "react";

const FeatureComparison = () => {
  return (
    <section className="bg-muted/50 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground sm:text-4xl">
          Why CineRate Beats Traditional Rating Platforms
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
          See how we compare to the competition
        </p>

        <Card className="overflow-x-auto">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="bg-primary/5 p-4 text-center font-semibold text-primary">
                    CineRate
                  </th>
                  <th className="p-4 text-center font-semibold text-muted-foreground">
                    IMDb
                  </th>
                  <th className="p-4 text-center font-semibold text-muted-foreground">
                    Rotten Tomatoes
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">
                    Multi-Category Ratings
                  </td>
                  <td className="bg-primary/5 p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        5 Categories
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">
                        Single Score
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">
                        Binary
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">
                    Personalized Recommendations
                  </td>
                  <td className="bg-primary/5 p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        AI-Powered
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Basic
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center flex items-center justify-center">
                    <X className="h-5 w-5 text-red-500" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">Community Insights</td>
                  <td className="bg-primary/5 p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        Detailed
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Limited
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Limited
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">Mobile-First Design</td>
                  <td className="bg-primary/5 p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        Optimized
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Decent
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Decent
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-foreground">Free to Use</td>
                  <td className="bg-primary/5 p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        Always Free
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </td>
                  <td className="p-4 text-center flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Key Differentiators */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-foreground">
                Only Platform with 5-Category Ratings
              </h3>
              <p className="text-sm text-muted-foreground">
                No other platform lets you rate acting, plot, cinematography,
                direction, and entertainment separately
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-foreground">
                Smarter Recommendations
              </h3>
              <p className="text-sm text-muted-foreground">
                Our AI learns your preferences across all 5 categories, not just
                overall scores
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Film className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-foreground">
                Beautiful, Modern Interface
              </h3>
              <p className="text-sm text-muted-foreground">
                Built from the ground up for mobile, with delightful animations
                and smooth interactions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparison;
