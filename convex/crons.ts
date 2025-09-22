// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at midnight UTC to update all user streaks
crons.daily(
  "update user streaks",
  { hourUTC: 0, minuteUTC: 0 },
  internal.achievements.updateAllUserStreaks,
);

// Run weekly to recompute achievements (optional)
crons.weekly(
  "recompute achievements",
  { dayOfWeek: "monday", hourUTC: 1, minuteUTC: 0 },
  internal.achievements.recomputeAllAchievements,
);

export default crons;
