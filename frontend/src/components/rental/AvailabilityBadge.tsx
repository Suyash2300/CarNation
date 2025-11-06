import { CarAvailability } from "../../services/carApi";
import { CheckCircle, Clock, XCircle } from "lucide-react";

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
      case "AVAILABLE":
        return {
          icon: CheckCircle,
          bgColor: "bg-success",
          textColor: "text-white",
          roundedClass: "rounded-[10px]",
          label: "Available Now",
        };
      case "RENTED":
        return {
          icon: XCircle,
          bgColor: "bg-error/10",
          textColor: "text-error",
          roundedClass: "rounded-full",
          label: "Currently Rented",
        };
      case "BOOKED_UNTIL":
        return {
          icon: Clock,
          bgColor: "bg-warning/10",
          textColor: "text-warning",
          roundedClass: "rounded-full",
          label: availability.nextAvailableDate
            ? `Available After ${new Date(
                availability.nextAvailableDate
              ).toLocaleDateString()}`
            : "Booked",
        };
      default:
        return {
          icon: Clock,
          bgColor: "bg-dark-100",
          textColor: "text-dark-700",
          roundedClass: "rounded-full",
          label: "Check Availability",
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor} ${config.roundedClass}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default AvailabilityBadge;
