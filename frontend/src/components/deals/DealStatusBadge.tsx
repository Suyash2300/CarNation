import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface DealStatusBadgeProps {
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
}

const DealStatusBadge = ({ status }: DealStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          bgColor: 'bg-warning-100',
          textColor: 'text-warning-700',
          label: 'Pending',
        };
      case 'ACCEPTED':
        return {
          icon: CheckCircle,
          bgColor: 'bg-primary-100',
          textColor: 'text-primary-700',
          label: 'Accepted',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          bgColor: 'bg-error-100',
          textColor: 'text-error-700',
          label: 'Rejected',
        };
      case 'COMPLETED':
        return {
          icon: DollarSign,
          bgColor: 'bg-success-100',
          textColor: 'text-success-700',
          label: 'Completed',
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-dark-100',
          textColor: 'text-dark-700',
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};

export default DealStatusBadge;

