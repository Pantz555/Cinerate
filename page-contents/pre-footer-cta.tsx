"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex-helpers/react/cache";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const PreFooterCta = () => {
  const { signIn } = useAuthActions();
  const isAuth = useQuery(api.auth.isAuthenticated);
  const [email, setEmail] = useState("");

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-12 text-center">
            {isAuth ? (
              <>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  Welcome back, movie lover! 🎬
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  You’re already part of our community. Ready to explore and
                  rate more movies?
                </p>
                <Link href="/discover">
                  <Button size="lg" className="h-12 px-8">
                    Go to Rate Movies
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  Ready to Rate Movies Your Way?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Join thousands of movie lovers who've discovered a better way
                  to rate and discover films.
                </p>

                <div className="mx-auto mb-6 flex max-w-md gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to get started"
                    className="h-12 flex-1"
                  />
                  <Link
                    href={`/auth?email=${email}`}
                    className={buttonVariants({
                      className: "h-12 px-6",
                      size: "lg",
                    })}
                  >
                    Get Started
                  </Link>
                </div>

                <div className="mb-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => void signIn("google")}
                    className="h-12 w-full max-w-md bg-transparent"
                  >
                    <Image
                      src="/google.png"
                      width={20}
                      height={20}
                      className="size-4 mr-2 shrink-0"
                      alt="google icon"
                    />
                    Or sign up with Google
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Free forever
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    2-minute setup
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PreFooterCta;
