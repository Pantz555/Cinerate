"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const { signIn } = useAuthActions();

  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getFriendlyErrorMessage = (error: any): string => {
    if (error instanceof Error) {
      if (error.message.includes("InvalidAccountId")) {
        return "Invalid email or password.";
      }
      if (error.message.includes("AccountNotFound")) {
        return "No account found with this email.";
      }
      if (error.message.includes("InvalidCredentials")) {
        return "Incorrect password.";
      }
      return error.message || "Unexpected error occurred.";
    }
    return "Unexpected error occurred.";
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget as any)["signin-email"].value.trim();
    const password = (e.currentTarget as any)["signin-password"].value.trim();

    try {
      setIsLoading(true);
      await signIn("password", { flow: "signIn", email, password });
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = (e.currentTarget as any)["signup-name"].value;
    const email = (e.currentTarget as any)["signup-email"].value;
    const password = (e.currentTarget as any)["signup-password"].value;

    try {
      setIsLoading(true);
      await signIn("password", { flow: "signUp", email, password, name });
      toast.success("Account created successfully!");
      router.push(`/?name=${encodeURIComponent(name)}&newUser=true`);
    } catch (err) {
      console.error(err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 💫 Magic Link (Resend) handler
  const handleMagicLink = async () => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingLink(true);
      await signIn("resend", { email, redirectTo: "/" });
      toast.success("Check your inbox! We've sent you a magic sign-in link.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CineRate
        </Link>

        <Card className="bg-card dark:bg-[#1a1a1a] dark:border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to CineRate
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join the community and start rating movies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary dark:bg-[#2a2a2a]">
                <TabsTrigger
                  value="signin"
                  className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-foreground transition-colors"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* --- Sign In Form --- */}
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 dark:bg-[#2a2a2a]"
                        required
                      />
                    </div>
                    <p>Admin email: admin@gmail.com</p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 dark:bg-[#2a2a2a]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p>Admin password: admin@123</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Magic Link login */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center border-border"
                    onClick={handleMagicLink}
                    disabled={isSendingLink}
                  >
                    {isSendingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send magic sign-in link
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => void signIn("google")}
                  variant="outline"
                  className="border-border w-full bg-secondary text-foreground hover:bg-accent"
                >
                  <Image
                    src="/google.png"
                    width={20}
                    height={20}
                    className="size-4 mr-2"
                    alt="google icon"
                  />
                  Google
                </Button>
              </TabsContent>

              {/* --- Sign Up Form --- */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10 dark:bg-[#2a2a2a]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 dark:bg-[#2a2a2a]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 dark:bg-[#2a2a2a]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                {/* Magic Link signup */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center border-border"
                    onClick={handleMagicLink}
                    disabled={isSendingLink}
                  >
                    {isSendingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Sign up via email link
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => void signIn("google")}
                  variant="outline"
                  className="border-border w-full bg-secondary text-foreground hover:bg-accent"
                >
                  <Image
                    src="/google.png"
                    width={20}
                    height={20}
                    className="size-4 mr-2"
                    alt="google icon"
                  />
                  Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
