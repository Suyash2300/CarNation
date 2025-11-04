import StarRating from "../common/StarRating";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      comment:
        "Amazing service! The booking process was seamless and the car was in perfect condition.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Weekend Explorer",
      comment:
        "Great prices and excellent customer support. Highly recommend CarNation for road trips!",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Daily Commuter",
      comment:
        "I've been using CarNation for months now. Reliable, affordable, and always on time.",
      rating: 4.5,
      avatar: "ER",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-heading">
            What Our Customers Say
          </h2>
          <p className="text-dark-600 text-lg">
            Join thousands of satisfied customers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <StarRating rating={testimonial.rating} size="sm" />
                  </div>
                  <Quote className="w-5 h-5 text-primary-400 opacity-60 mb-2" />
                </div>
              </div>
              <p className="text-dark-700 mb-6 italic leading-relaxed">
                "{testimonial.comment}"
              </p>
              <div className="pt-4 border-t border-dark-200">
                <p className="font-bold text-dark-900">{testimonial.name}</p>
                <p className="text-sm text-dark-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

