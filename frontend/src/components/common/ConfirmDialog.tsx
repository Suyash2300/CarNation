import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'border-error-500 bg-error-50',
    warning: 'border-warning-500 bg-warning-50',
    info: 'border-primary-500 bg-primary-50',
  };

  const confirmButtonClasses =
    variant === 'danger'
      ? 'bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white border border-error-600 shadow-lg hover:shadow-xl'
      : variant === 'warning'
      ? 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500 text-white border border-warning-600 shadow-lg hover:shadow-xl'
      : 'bg-gradient-primary hover:bg-gradient-primary-dark focus:ring-primary-500 text-white border border-primary-600 shadow-lg hover:shadow-xl';

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in border-2 border-dark-200">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-xl ${
              variant === 'danger'
                ? 'bg-error-100'
                : variant === 'warning'
                ? 'bg-warning-100'
                : 'bg-primary-100'
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${
                variant === 'danger'
                  ? 'text-error-600'
                  : variant === 'warning'
                  ? 'text-warning-600'
                  : 'text-primary-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-900 mb-2">{title}</h3>
            <p className="text-dark-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-600 transition p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className={confirmButtonClasses}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

