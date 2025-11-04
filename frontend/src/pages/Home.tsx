import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import PopularCarsSection from "../components/home/PopularCarsSection";
import StatisticsSection from "../components/home/StatisticsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <PopularCarsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
