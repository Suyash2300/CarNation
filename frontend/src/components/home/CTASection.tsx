import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import Button from "../common/Button";

const CTASection = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-gradient-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading animate-fade-in-up">
          Ready to Hit the Road?
        </h2>
        <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Join thousands of satisfied customers and start your journey today
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="px-10 py-4 text-lg bg-white text-primary-600 border-white hover:bg-gray-100 hover:border-gray-100"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/signup")}
              className="px-10 py-4 text-lg bg-white text-primary-600 border-white hover:bg-gray-100 hover:border-gray-100"
            >
              Get Started Now
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;

