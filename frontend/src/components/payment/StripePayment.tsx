import { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface StripePaymentProps {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onError?: (error: any) => void;
}

const PaymentForm = ({
  amount,
  onSuccess,
  onError,
  clientSecret,
}: {
  amount: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onError?: (error: any) => void;
  clientSecret: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!stripe || !elements) {
      setError('Payment form is not ready. Please wait a moment and try again.');
      return;
    }

    if (isLoading || isProcessing) {
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError(null);

    try {
      const validationResult = await elements.submit();
      
      if (validationResult.error) {
        setError(validationResult.error.message || 'Please check your card details');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setIsLoading(false);
        setIsProcessing(false);
        if (onError) {
          onError(confirmError);
        }
        return;
      }

      if (!paymentIntent) {
        setError('Payment confirmation did not return a payment intent');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        try {
          await onSuccess(paymentIntent.id);
          setIsLoading(false);
          setIsProcessing(false);
        } catch (successError: any) {
          setError(successError?.message || 'Payment succeeded but verification failed');
          setIsLoading(false);
          setIsProcessing(false);
          if (onError) {
            onError(successError);
          }
        }
      } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation') {
        setError('Payment requires additional authentication. Please try again or use a different card.');
        setIsLoading(false);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'processing') {
        setTimeout(async () => {
          try {
            const updatedPaymentIntent = await stripe.retrievePaymentIntent(paymentIntent.id);
            if (updatedPaymentIntent.status === 'succeeded') {
              await onSuccess(updatedPaymentIntent.id);
            } else {
              setError(`Payment is still ${updatedPaymentIntent.status}. Please refresh and check your dashboard.`);
            }
          } catch (err) {
            setError('Payment is processing. Please check your dashboard in a moment.');
          }
          setIsLoading(false);
          setIsProcessing(false);
        }, 2000);
      } else {
        setError(`Payment status: ${paymentIntent.status}. Please contact support if the issue persists.`);
        setIsLoading(false);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Payment failed. Please try again.');
      setIsLoading(false);
      setIsProcessing(false);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div 
      className="space-y-4"
      onKeyDown={(e) => {
        // Allow Enter key to trigger payment if button is enabled
        if (e.key === 'Enter' && stripe && elements && !isLoading && !isProcessing) {
          e.preventDefault();
          const fakeEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.FormEvent;
          handleSubmit(fakeEvent);
        }
      }}
    >
      <div id="stripe-payment-element">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-error-900">Payment Error</p>
            <p className="text-sm text-error-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      {(!stripe || !elements) && (
        <div className="bg-info-50 border border-info-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-info-700">Loading payment form...</p>
        </div>
      )}
      <button
        type="button"
        disabled={isLoading || isProcessing || !stripe || !elements}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (!stripe || !elements) {
            setError('Payment form is still loading. Please wait a moment and try again.');
            return;
          }
          
          if (isLoading || isProcessing) {
            return;
          }
          
          const fakeEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.FormEvent;
          await handleSubmit(fakeEvent);
        }}
        className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          cursor: (isLoading || isProcessing || !stripe || !elements) ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : !stripe || !elements ? (
          <span>Loading payment form...</span>
        ) : (
          <span>Pay ₹{Math.round(amount / 100).toLocaleString('en-IN')}</span>
        )}
      </button>
    </div>
  );
};

const StripePayment = ({
  clientSecret,
  publishableKey,
  amount,
  onSuccess,
  onError,
}: StripePaymentProps) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Load Stripe if we have a valid publishable key
    if (publishableKey && 
        publishableKey !== 'pk_test_mock' && 
        publishableKey !== 'pk_test_placeholder' &&
        publishableKey.startsWith('pk_')) {
      setStripePromise(loadStripe(publishableKey));
      setIsTestMode(publishableKey.startsWith('pk_test_'));
    } else {
      // Mock mode - simulate payment
      setIsTestMode(true);
    }
  }, [publishableKey]);


  // Mock mode handler - only show if no valid publishable key
  if (publishableKey === 'pk_test_mock' || publishableKey === 'pk_test_placeholder' || !stripePromise) {
    return (
      <div className="space-y-4">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-warning-900 text-sm mb-1">MOCK PAYMENT MODE</p>
            <p className="text-xs text-warning-700 mb-2">
              Stripe test keys not configured. Payment will be simulated locally.
            </p>
            <p className="text-xs text-warning-600 font-medium">
              💡 To see the real Stripe payment interface, add your Stripe test keys to backend/.env:
            </p>
            <div className="text-xs bg-warning-100 px-2 py-1 rounded mt-2 block font-mono">
              <div>STRIPE_SECRET_KEY="sk_test_..."</div>
              <div>STRIPE_PUBLISHABLE_KEY="pk_test_..."</div>
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            try {
              await onSuccess(`pi_test_mock_${Date.now()}`);
            } catch (err) {
              if (onError) {
                onError(err);
              }
            }
          }}
          className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
        >
          Pay ₹{(amount / 100).toLocaleString()} (Mock)
        </button>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4F46E5',
      },
    },
  };

  return (
    <div className="space-y-4">
      {isTestMode && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-warning-900 text-sm">TEST MODE</p>
            <p className="text-xs text-warning-700">
              This is a test payment. Use test card: 4242 4242 4242 4242
            </p>
          </div>
        </div>
      )}
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm 
          amount={amount} 
          onSuccess={onSuccess} 
          onError={onError}
          clientSecret={clientSecret}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;

