import { Shield, Car, Award, MessageCircle, Zap } from "lucide-react";
import ConnectionsSVG from "../ConnectionsSVG";

const FeaturesSection = () => {
  // Staggered 5-card layout with consistent icon set
  const features = {
    central: {
      icon: Shield,
      title: "Fully Insured & Secure",
      description:
        "Drive with peace. All rentals and transactions are protected with insurance and secure processes.",
      position: "center",
    },
    surrounding: [
      {
        icon: Car,
        title: "Wide Selection",
        description:
          "Discover a vast fleet from economy to luxury, and a diverse marketplace of used cars.",
        position: "top-left",
      },
      {
        icon: Award,
        title: "Best Prices",
        description:
          "Competitive rates with transparent pricing. No hidden fees, guaranteed.",
        position: "top-right",
      },
      {
        icon: MessageCircle,
        title: "24/7 Support",
        description:
          "Our expert support team is always on standby to assist you every step of the way.",
        position: "bottom-right",
      },
      {
        icon: Zap,
        title: "Easy Booking",
        description:
          "Simple and secure booking process. Get your car in minutes, not hours.",
        position: "bottom-left",
      },
    ],
  };

  return (
    <section className="py-16 md:py-24 bg-light-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-dark-900 mb-16 font-heading">
          Why Choose CarNation?
        </h2>

        {/* Hub and Spoke Layout - Staggered */}
        <div
          className="relative min-h-[650px] flex items-center justify-center"
          id="features-container"
        >
          {/* Central Feature - Larger and elevated */}
          <div
            id="central-feature"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="glass rounded-xl p-8 shadow-2xl max-w-xs border-2 border-primary/20 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-primary-600 mb-4 flex justify-center">
                <features.central.icon className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3 text-center">
                {features.central.title}
              </h3>
              <p className="text-dark-700 text-left text-sm leading-relaxed">
                {features.central.description}
              </p>
            </div>
          </div>

          {/* Surrounding Features - Staggered positions */}
          {features.surrounding.map((feature, index) => {
            const IconComponent = feature.icon;
            const positions = {
              "top-left": "top-12 left-12",
              "top-right": "top-12 right-12",
              "bottom-left": "bottom-12 left-12",
              "bottom-right": "bottom-12 right-12",
            };

            return (
              <div
                key={index}
                id={`feature-${index}`}
                className={`absolute ${
                  positions[feature.position as keyof typeof positions]
                } z-10`}
              >
                <div className="glass rounded-xl p-6 shadow-xl w-[280px] border border-primary/10 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="text-primary-600 mb-4 flex justify-center">
                    <IconComponent className="w-14 h-14" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-900 mb-2 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-dark-700 text-left text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Connecting Lines - Light dotted lines */}
          <ConnectionsSVG />
        </div>

        {/* Mobile Layout - Stack vertically */}
        <div className="md:hidden space-y-6 mt-8">
          {/* Central Feature for Mobile */}
          <div className="glass rounded-xl p-6 shadow-xl border-2 border-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-primary mb-4 flex justify-center">
              <features.central.icon className="w-14 h-14" />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-3 text-center">
              {features.central.title}
            </h3>
            <p className="text-dark-700 text-left text-sm leading-relaxed">
              {features.central.description}
            </p>
          </div>

          {/* Surrounding Features for Mobile */}
          {features.surrounding.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-6 shadow-lg border border-primary/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-dark-900 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-dark-700 text-left text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
