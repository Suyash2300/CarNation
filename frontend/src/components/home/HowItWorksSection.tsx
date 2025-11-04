import { Search, Calendar, CreditCard, Car } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: 'Browse & Select',
      description: 'Explore our wide selection of cars and find the perfect match for your needs',
      color: 'primary',
    },
    {
      icon: Calendar,
      title: 'Book Your Dates',
      description: 'Choose your pickup and return dates for rentals or contact seller for purchases',
      color: 'secondary',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Complete your booking with our secure and hassle-free payment process',
      color: 'accent',
    },
    {
      icon: Car,
      title: 'Hit the Road',
      description: 'Enjoy your ride! We handle all the paperwork and insurance for you',
      color: 'success',
    },
  ];

  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    accent: 'bg-accent-100 text-accent-600',
    success: 'bg-success-100 text-success-600',
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-heading">
            How It Works
          </h2>
          <p className="text-dark-600 text-lg">
            Get your car in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 mt-4">
                  <div
                    className={`p-4 rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-dark-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-dark-600 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                    <div className="w-8 h-0.5 bg-primary-200"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-primary-200 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

