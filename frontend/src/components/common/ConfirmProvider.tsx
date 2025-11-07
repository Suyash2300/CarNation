import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import ConfirmDialog from "./ConfirmDialog";

type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context.confirm;
};

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolverRef = useRef<(value: boolean) => void>();

  const closeDialog = useCallback((result: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = undefined;
    }
    setState(null);
  }, []);

  const handleConfirm = useCallback(() => {
    closeDialog(true);
  }, [closeDialog]);

  const handleCancel = useCallback(() => {
    closeDialog(false);
  }, [closeDialog]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        variant: options.variant,
        isLoading: options.isLoading,
      });
    });
  }, []);

  const contextValue = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      {state?.isOpen && (
        <ConfirmDialog
          isOpen
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={state.title}
          message={state.message}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          variant={state.variant}
          isLoading={state.isLoading}
        />
      )}
    </ConfirmContext.Provider>
  );
};
