const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      comment:
        "Amazing service! The booking process was seamless and the car was in perfect condition.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Weekend Explorer",
      comment:
        "Great prices and excellent customer support. Highly recommend CarNation for road trips!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Daily Commuter",
      comment:
        "I've been using CarNation for months now. Reliable, affordable, and always on time.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-dark-900 mb-12 font-heading">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass rounded-xl p-6 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-accent">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-dark-800 mb-4 italic">
                "{testimonial.comment}"
              </p>
              <div>
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

