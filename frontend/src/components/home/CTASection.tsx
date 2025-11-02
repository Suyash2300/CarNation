import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

const CTASection = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading">
          Ready to Hit the Road?
        </h2>
        <p className="text-xl mb-8 text-white/90">
          Join thousands of satisfied customers and start your journey today
        </p>
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-xl"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/signup")}
            className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-xl"
          >
            Get Started Now
          </button>
        )}
      </div>
    </section>
  );
};

export default CTASection;

