"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Download,
  Bell,
  Mail,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Check,
  Loader2,
} from "lucide-react";
import { exportToCSV, exportToJSON, downloadFile } from "@/lib/data-export";
import { toast } from "sonner";

export default function SettingsPage() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const updateNotifications = useMutation(
    api.settings.updateNotificationPreferences,
  );
  const exportUserData = useQuery(api.settings.exportUserData);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newReviews: true,
    ratingResponses: false,
    weeklyDigest: true,
    trendingMovies: true,
    recommendations: true,
    communityActivity: false,
    achievements: true,
  });

  const [exportStatus, setExportStatus] = useState<
    "idle" | "exporting" | "success"
  >("idle");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when data loads
  useState(() => {
    if (userSettings?.notifications) {
      setNotifications(userSettings.notifications);
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateNotifications({ notifications });
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!exportUserData) {
      toast.error("No data available to export");
      return;
    }

    setExportStatus("exporting");
    setTimeout(() => {
      const csv = exportToCSV(exportUserData);
      downloadFile(
        csv,
        `cinerate-ratings-${new Date().toISOString().split("T")[0]}.csv`,
        "text/csv",
      );
      setExportStatus("success");
      toast.success("CSV exported successfully!");
      setTimeout(() => setExportStatus("idle"), 3000);
    }, 500);
  };

  const handleExportJSON = () => {
    if (!exportUserData) {
      toast.error("No data available to export");
      return;
    }

    setExportStatus("exporting");
    setTimeout(() => {
      const json = exportToJSON(exportUserData);
      downloadFile(
        json,
        `cinerate-ratings-${new Date().toISOString().split("T")[0]}.json`,
        "application/json",
      );
      setExportStatus("success");
      toast.success("JSON exported successfully!");
      setTimeout(() => setExportStatus("idle"), 3000);
    }, 500);
  };

  if (userSettings === undefined) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <Header />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Profile
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">Settings</span>
          </nav>
          <h1 className="text-foreground text-3xl md:text-4xl font-extrabold tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and data
          </p>
        </div>

        <div className="space-y-6">
          {/* Data Export Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Download your rating data in CSV or JSON format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg border border-border">
                <h4 className="text-foreground font-semibold mb-2">
                  Your Data Includes:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All movie ratings across 5 categories</li>
                  <li>• Review comments and timestamps</li>
                  <li>• Movie titles and genres</li>
                  <li>• Overall rating calculations</li>
                </ul>
                {exportUserData && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Total ratings:{" "}
                    <span className="font-semibold text-foreground">
                      {exportUserData.length}
                    </span>
                  </p>
                )}
              </div>

              {exportStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Export completed successfully!
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleExportCSV}
                  disabled={
                    exportStatus === "exporting" ||
                    !exportUserData ||
                    exportUserData.length === 0
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {exportStatus === "exporting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExportJSON}
                  disabled={
                    exportStatus === "exporting" ||
                    !exportUserData ||
                    exportUserData.length === 0
                  }
                  variant="outline"
                  className="flex-1 border-border bg-accent text-foreground hover:bg-accent/80"
                >
                  {exportStatus === "exporting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label
                        htmlFor="email-notifications"
                        className="text-foreground font-medium cursor-pointer"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("emailNotifications", checked)
                    }
                  />
                </div>

                {/* Individual Notification Types */}
                <div className="ml-4 space-y-3 border-l-2 border-border pl-4">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      <div>
                        <Label
                          htmlFor="new-reviews"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          New Reviews
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When someone reviews a movie you rated
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="new-reviews"
                      checked={notifications.newReviews}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("newReviews", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-amber-400" />
                      <div>
                        <Label
                          htmlFor="rating-responses"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Rating Responses
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When someone responds to your ratings
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="rating-responses"
                      checked={notifications.ratingResponses}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("ratingResponses", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-purple-400" />
                      <div>
                        <Label
                          htmlFor="weekly-digest"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Weekly Digest
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Summary of your activity and recommendations
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("weeklyDigest", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-red-400" />
                      <div>
                        <Label
                          htmlFor="trending-movies"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Trending Movies
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Notifications about popular movies
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="trending-movies"
                      checked={notifications.trendingMovies}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("trendingMovies", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <div>
                        <Label
                          htmlFor="recommendations"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Personalized Recommendations
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Movie suggestions based on your ratings
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="recommendations"
                      checked={notifications.recommendations}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("recommendations", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <div>
                        <Label
                          htmlFor="community-activity"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Community Activity
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Updates from the CineRate community
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="community-activity"
                      checked={notifications.communityActivity}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("communityActivity", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-orange-400" />
                      <div>
                        <Label
                          htmlFor="achievements"
                          className="text-foreground text-sm cursor-pointer"
                        >
                          Achievements
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When you unlock new badges and milestones
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="achievements"
                      checked={notifications.achievements}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("achievements", checked)
                      }
                      disabled={!notifications.emailNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
