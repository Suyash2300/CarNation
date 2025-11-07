import { useState, useEffect, useRef } from "react";
import { Shield, Store, Award, MessageCircle, Zap, CheckCircle2, ArrowRight } from "lucide-react";

interface Feature {
  icon: typeof Shield;
  title: string;
  description: string;
  metric: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features: Feature[] = [
    {
      icon: Shield,
      title: "Fully Insured & Secure",
      description:
        "Drive with complete peace of mind. All rentals and transactions are protected with comprehensive insurance and secure processes.",
      metric: "100% Coverage",
      color: "text-primary-700",
      bgColor: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      borderColor: "border-primary-200",
    },
    {
      icon: Store,
      title: "Wide Selection",
      description:
        "Discover a vast fleet from economy to luxury vehicles, and a diverse marketplace of quality used cars.",
      metric: "500+ Vehicles",
      color: "text-primary-700",
      bgColor: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      borderColor: "border-primary-200",
    },
    {
      icon: Award,
      title: "Best Prices",
      description:
        "Competitive rates with transparent pricing. No hidden fees, no surprises. Guaranteed best deals.",
      metric: "Price Match",
      color: "text-primary-700",
      bgColor: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      borderColor: "border-primary-200",
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description:
        "Our expert support team is always on standby to assist you every step of the way, anytime you need us.",
      metric: "Always Available",
      color: "text-primary-700",
      bgColor: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      borderColor: "border-primary-200",
    },
    {
      icon: Zap,
      title: "Easy Booking",
      description:
        "Simple and secure booking process. Get your car in minutes, not hours. Fast, efficient, and hassle-free.",
      metric: "5 Min Setup",
      color: "text-primary-700",
      bgColor: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      borderColor: "border-primary-200",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-light-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-heading">
            Why Choose CarNation?
          </h2>
          <p className="text-dark-600 text-lg max-w-2xl mx-auto">
            Experience the best in car rental and buying with unmatched benefits
          </p>
        </div>

        {/* Pipeline Nodes Design - Desktop */}
        <div className="hidden lg:block relative">
          {/* Pipeline Container with connecting line */}
          <div className="relative py-12">
            {/* Horizontal Connecting Line */}
            <div className={`absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 opacity-50 transition-opacity duration-1000 ${isVisible ? 'opacity-70' : ''}`} />
            
            {/* Nodes Container */}
            <div className="relative flex items-start justify-between px-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                const isLast = index === features.length - 1;
                const animationDelay = index * 150; // Staggered animation
                
                return (
                  <div 
                    key={index} 
                    className="relative flex-1 flex flex-col items-center group z-10"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: `opacity 0.6s ease-out ${animationDelay}ms, transform 0.6s ease-out ${animationDelay}ms`
                    }}
                  >
                    {/* Connecting Arrow (except last node) */}
                    {!isLast && (
                      <div className="absolute top-20 left-[calc(50%+40px)] right-[-40px] h-0.5 pointer-events-none">
                        <div className="relative h-full">
                          {/* Arrow Line - Consistent primary color */}
                          <div 
                            className="absolute left-0 right-0 h-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-500 to-primary-600"
                          />
                          {/* Arrow Head */}
                          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 transition-colors drop-shadow-sm text-primary-500 group-hover:text-primary-700" />
                        </div>
                      </div>
                    )}

                    {/* Node Circle */}
                    <div className="relative mb-6">
                      <div className={`${feature.bgColor} w-20 h-20 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 border-4 border-white relative z-10`}>
                        <IconComponent className="w-10 h-10 text-white drop-shadow-sm" />
                      </div>
                      {/* Pulse Animation Ring */}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 group-hover:animate-ping bg-primary-500" />
                    </div>

                    {/* Node Content Card - Fixed height for consistency */}
                    <div className="w-full max-w-[220px] mx-auto bg-white rounded-xl p-5 shadow-lg border-2 border-dark-100 group-hover:border-primary-300 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 min-h-[180px] flex flex-col">
                      {/* Metric Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 bg-primary-50 border border-primary-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-700" />
                        <span className="text-xs font-bold text-primary-700">
                          {feature.metric}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-dark-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-dark-600 text-xs leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Vertical Stack */}
        <div className="lg:hidden space-y-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isLast = index === features.length - 1;
            const animationDelay = index * 100;
            
            return (
              <div 
                key={index} 
                className="relative"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease-out ${animationDelay}ms, transform 0.5s ease-out ${animationDelay}ms`
                }}
              >
                <div className="flex items-start gap-4 group">
                  {/* Node Circle */}
                  <div className="relative flex-shrink-0">
                    <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-white`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {/* Connecting Line (vertical, except last) */}
                    {!isLast && (
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-primary-500 to-primary-600 opacity-60" />
                    )}
                  </div>

                  {/* Content Card - Fixed height for consistency */}
                  <div className="flex-1 bg-white rounded-xl p-5 shadow-md border border-dark-100 group-hover:shadow-lg group-hover:border-primary-300 transition-all duration-300 min-h-[140px] flex flex-col">
                    {/* Metric Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 bg-primary-50 border border-primary-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-700" />
                      <span className="text-xs font-bold text-primary-700">
                        {feature.metric}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-dark-900 mb-2 group-hover:text-primary-700 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-dark-600 text-sm leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-dark-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">4.9/5</div>
              <div className="text-sm text-dark-600">Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">2000+</div>
              <div className="text-sm text-dark-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">500+</div>
              <div className="text-sm text-dark-600">Available Cars</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">25+</div>
              <div className="text-sm text-dark-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
