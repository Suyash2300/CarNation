import { useEffect, useState } from "react";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: RazorpayPrefill;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayPaymentProps {
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  };
  onSuccess: (response: RazorpaySuccessResponse) => Promise<void>;
  onError?: (error: unknown) => void;
  description?: string;
  prefill?: RazorpayPrefill;
}

const RazorpayPayment = ({
  orderData,
  onSuccess,
  onError,
  description = "Payment",
  prefill,
}: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    ) {
      return (err as { message?: string }).message ?? fallback;
    }
    return fallback;
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded");
    };
    script.onerror = () => {
      setError("Failed to load Razorpay. Please refresh the page.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handlePayment = async () => {
    const isMockMode = orderData.key === "rzp_test_mock";

    // Test mode: Mock payment without Razorpay
    if (isMockMode) {
      setIsLoading(true);
      setError(null);

      // Simulate payment delay
      setTimeout(async () => {
        try {
          const mockResponse = {
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: `sig_test_${Date.now()}`,
          };

          await onSuccess(mockResponse);
          setIsLoading(false);
        } catch (err) {
          setError(getErrorMessage(err, "Payment verification failed"));
          setIsLoading(false);
          onError?.(err);
        }
      }, 1000);
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay is not loaded. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CarNation",
        description,
        order_id: orderData.orderId,
        prefill: prefill || {},
        theme: {
          color: "#4F46E5",
        },
        handler: async (response) => {
          try {
            setIsLoading(true);
            await onSuccess(response);
            setIsLoading(false);
          } catch (err) {
            setError(getErrorMessage(err, "Payment verification failed"));
            setIsLoading(false);
            onError?.(err);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            onError?.(new Error("Payment cancelled"));
          },
        },
      };

      const RazorpayConstructor = window.Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Razorpay SDK not available");
      }
      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
      setIsLoading(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to initialize payment"));
      setIsLoading(false);
      onError?.(err);
    }
  };

  const isTestMode =
    orderData.key?.startsWith("rzp_test_") || orderData.key === "rzp_test_mock";
  const isMockMode = orderData.key === "rzp_test_mock";

  return (
    <div className="space-y-4">
      {(isTestMode || isMockMode) && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-warning-900 text-sm">TEST MODE</p>
            <p className="text-xs text-warning-700">
              {isMockMode
                ? "Mock payment mode - No real charges. Payment will auto-complete."
                : "This is a test payment. No real charges will be made."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-error-900">Payment Error</p>
            <p className="text-sm text-error-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isLoading || (!isMockMode && !window.Razorpay)}
        className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <span>Pay ₹{(orderData.amount / 100).toLocaleString()}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RazorpayPayment;
