import { lazy, Suspense } from "react";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import Footer from "../components/layout/Footer";

// Lazy load below-the-fold sections
const StatisticsSection = lazy(
  () => import("../components/home/StatisticsSection")
);
const FeaturesSection = lazy(
  () => import("../components/home/FeaturesSection")
);
const PopularCarsSection = lazy(
  () => import("../components/home/PopularCarsSection")
);
const HowItWorksSection = lazy(
  () => import("../components/home/HowItWorksSection")
);
const TestimonialsSection = lazy(
  () => import("../components/home/TestimonialsSection")
);
const CTASection = lazy(() => import("../components/home/CTASection"));

// Section skeleton loader
const SectionSkeleton = () => (
  <div className="py-12 md:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-dark-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-dark-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-dark-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <StatisticsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PopularCarsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CTASection />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Home;
