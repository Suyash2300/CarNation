import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'primary';
}

const FilterChip = ({ label, onRemove, variant = 'default' }: FilterChipProps) => {
  const variantClasses = {
    default: 'bg-dark-100 text-dark-700 hover:bg-dark-200 border-dark-200',
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${variantClasses[variant]}`}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-current/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default FilterChip;

