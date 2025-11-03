import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  suffix?: string;
  prefix?: string;
  progress?: {
    current: number;
    max: number;
  };
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  suffix = '',
  prefix = '',
  progress,
}: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-600',
      value: 'text-primary-600',
    },
    success: {
      bg: 'bg-success-100',
      icon: 'text-success-600',
      value: 'text-success-600',
    },
    warning: {
      bg: 'bg-warning-100',
      icon: 'text-warning-600',
      value: 'text-warning-600',
    },
    error: {
      bg: 'bg-error-100',
      icon: 'text-error-600',
      value: 'text-error-600',
    },
    info: {
      bg: 'bg-secondary-100',
      icon: 'text-secondary-600',
      value: 'text-secondary-600',
    },
  };

  const colors = colorClasses[color];
  const progressPercentage = progress ? (progress.current / progress.max) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-dark-900">
              {prefix}
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
              {suffix}
            </span>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  trend.isPositive
                    ? 'bg-success-100 text-success-700'
                    : 'bg-error-100 text-error-700'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
        <div
          className={`${colors.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>

      {progress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-dark-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold">
              {progress.current} / {progress.max === -1 ? '∞' : progress.max}
            </span>
          </div>
          <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${colors.bg} transition-all duration-500 rounded-full`}
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;

