import { CarAvailability } from '../../services/carApi';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface AvailabilityBadgeProps {
  availability?: CarAvailability;
}

const AvailabilityBadge = ({ availability }: AvailabilityBadgeProps) => {
  if (!availability) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-dark-100 text-dark-700">
        Status Unknown
      </span>
    );
  }

  const getBadgeConfig = () => {
    switch (availability.status) {
      case 'AVAILABLE':
        return {
          icon: CheckCircle,
          bgColor: 'bg-success-100',
          textColor: 'text-success-700',
          label: 'Available Now',
        };
      case 'RENTED':
        return {
          icon: XCircle,
          bgColor: 'bg-error-100',
          textColor: 'text-error-700',
          label: 'Currently Rented',
        };
      case 'BOOKED_UNTIL':
        return {
          icon: Clock,
          bgColor: 'bg-warning-100',
          textColor: 'text-warning-700',
          label: availability.nextAvailableDate
            ? `Available After ${new Date(availability.nextAvailableDate).toLocaleDateString()}`
            : 'Booked',
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-dark-100',
          textColor: 'text-dark-700',
          label: 'Check Availability',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default AvailabilityBadge;

