import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import HeroSection from "./hero-section";
import ProblemStatement from "./problem-statement";
import SolutionShowcase from "./solution-showcase";
import HowItWorks from "./how-it-works";
import SocialProof from "./social-proof";
import FeatureComparison from "./feature-comparison";
import PreFooterCta from "./pre-footer-cta";

export default function HomepageContent() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem Statement */}
      <ProblemStatement />

      {/* Solution Showcase */}
      <SolutionShowcase />

      {/* How It Works */}
      <HowItWorks />

      {/* Social Proof & Community */}
      <SocialProof />

      {/* Feature Comparison */}
      <FeatureComparison />

      {/* Pre-Footer CTA */}
      <PreFooterCta />

      <Footer />
    </div>
  );
}
