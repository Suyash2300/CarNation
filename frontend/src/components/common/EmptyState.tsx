import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className = '',
}: EmptyStateProps) => {
  const actionContent = actionLabel && (
    <>
      {actionLink ? (
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center gap-2 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </>
  );

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
        <Icon className="w-10 h-10 text-primary-600" />
      </div>
      <h3 className="text-2xl font-bold text-dark-900 mb-2">{title}</h3>
      <p className="text-dark-600 max-w-md mx-auto mb-6">{description}</p>
      {actionContent}
    </div>
  );
};

export default EmptyState;

