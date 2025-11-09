import { useState } from "react";
import {
  useGetTiersQuery,
  useGetSubscriptionStatusQuery,
  useCreateSubscriptionOrderMutation,
  useVerifySubscriptionPaymentMutation,
  useActivateFreeTierMutation,
  useCancelSubscriptionMutation,
} from "../../services/subscriptionApi";
import StripePayment from "../payment/StripePayment";
import {
  CheckCircle,
  XCircle,
  Crown,
  Zap,
  Gift,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../common/ToastContainer";
import { useConfirm } from "../common/ConfirmProvider";
import { getApiErrorMessage } from "../../utils/error";

const SubscriptionManagement = () => {
  const [selectedTier, setSelectedTier] = useState<"BASIC" | "PREMIUM" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: tiersData } = useGetTiersQuery();
  const { data: statusData, refetch: refetchStatus } =
    useGetSubscriptionStatusQuery();
  const [createOrder] = useCreateSubscriptionOrderMutation();
  const [verifyPayment] = useVerifySubscriptionPaymentMutation();
  const [activateFree, { isLoading: isActivatingFree }] =
    useActivateFreeTierMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();
  const { showSuccess, showError, showInfo } = useToast();
  const confirm = useConfirm();

  const tiers = tiersData?.tiers || {};
  const status = statusData;

  const handleActivateFree = async () => {
    try {
      await activateFree().unwrap();
      showSuccess("FREE tier activated successfully! You can now list 2 cars.");
      refetchStatus();
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to activate FREE tier");
      showError(message);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = await confirm({
      title: "Cancel Subscription",
      message:
        "Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.",
      confirmLabel: "Cancel Subscription",
      cancelLabel: "Keep Subscription",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const result = await cancelSubscription().unwrap();
      showSuccess(result.message);
      if (result.note) {
        showInfo(result.note);
      }
      refetchStatus();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to cancel subscription"
      );
      showError(message);
    }
  };

  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    publishableKey: string;
    amount: number;
    tier: "BASIC" | "PREMIUM";
  } | null>(null);

  const handleUpgrade = async (tier: "BASIC" | "PREMIUM") => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSelectedTier(tier);

    try {
      // Create Stripe payment intent
      const paymentResponse = await createOrder({ tier }).unwrap();

      setPaymentData({
        clientSecret: paymentResponse.clientSecret,
        publishableKey: paymentResponse.publishableKey,
        amount: tiers[tier]?.price || 0,
        tier,
      });
      setIsProcessing(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to create payment order"
      );
      showError(message);
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentData) return;

    try {
      await verifyPayment({
        paymentIntentId,
        tier: paymentData.tier,
      }).unwrap();

      showSuccess("Subscription activated successfully!");
      refetchStatus();
      setPaymentData(null);
      setSelectedTier(null);
    } catch (error) {
      const message = getApiErrorMessage(error, "Payment verification failed");
      showError(message);
    }
  };

  const getTierIcon = (tierKey: string) => {
    switch (tierKey) {
      case "FREE":
        return <Gift className="w-6 h-6" />;
      case "BASIC":
        return <Zap className="w-6 h-6" />;
      case "PREMIUM":
        return <Crown className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const isCurrentTier = (tierKey: string) => {
    return (
      status?.tier === tierKey &&
      (status?.status === "ACTIVE" || status?.status === "CANCELLED")
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900">
          Subscription Management
        </h2>
        <p className="text-dark-600 mt-1">
          Manage your subscription to list more cars
        </p>
      </div>

      {/* Current Status */}
      {status && (
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">
            Current Plan
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                status.tier === "FREE"
                  ? "bg-dark-100"
                  : status.tier === "BASIC"
                  ? "bg-primary-100"
                  : "bg-yellow-100"
              }`}
            >
              {getTierIcon(status.tier)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-dark-900">
                  {status.tierInfo.name}
                </span>
                {status.status === "ACTIVE" ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : status.status === "CANCELLED" ? (
                  <AlertCircle className="w-5 h-5 text-warning-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-error-600" />
                )}
              </div>
              <p className="text-sm text-dark-600">
                {status.currentListings} /{" "}
                {status.maxListings === -1 ? "Unlimited" : status.maxListings}{" "}
                listings
              </p>
              {status.endDate && (
                <p className="text-xs text-dark-500 mt-1">
                  {status.status === "CANCELLED" ? (
                    <span className="flex items-center gap-1 text-warning-700">
                      <AlertCircle className="w-3 h-3" />
                      Cancelled - Active until{" "}
                      {new Date(status.endDate).toLocaleDateString()}
                    </span>
                  ) : status.status === "ACTIVE" ? (
                    `Expires on ${new Date(
                      status.endDate
                    ).toLocaleDateString()}`
                  ) : (
                    `Expired on ${new Date(
                      status.endDate
                    ).toLocaleDateString()}`
                  )}
                </p>
              )}
            </div>
          </div>
          {status.status === "ACTIVE" && status.tier !== "FREE" && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="mt-4 w-full px-4 py-2 bg-error-100 hover:bg-error-200 text-error-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed border border-error-300"
            >
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          )}
        </div>
      )}

      {/* Stripe Payment Form */}
      {paymentData && (
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">
            Complete Payment for {tiers[paymentData.tier]?.name} Subscription
          </h3>
          <StripePayment
            clientSecret={paymentData.clientSecret}
            publishableKey={paymentData.publishableKey}
            amount={paymentData.amount * 100}
            onSuccess={handlePaymentSuccess}
            onError={(err) => {
              const message = getApiErrorMessage(err, "Payment failed");
              showError(message);
              setPaymentData(null);
              setSelectedTier(null);
              setIsProcessing(false);
            }}
          />
          <button
            onClick={() => {
              setPaymentData(null);
              setSelectedTier(null);
              setIsProcessing(false);
            }}
            className="mt-4 w-full px-4 py-2 border-2 border-dark-300 text-dark-700 font-semibold rounded-lg hover:bg-dark-50 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tiers).map(([tierKey, tier]) => {
          const tierKeyTyped = tierKey as "FREE" | "BASIC" | "PREMIUM";
          const isCurrent = isCurrentTier(tierKey);
          const isPaidTier =
            tierKeyTyped === "BASIC" || tierKeyTyped === "PREMIUM";
          const canUpgrade = isPaidTier && !isCurrent;

          return (
            <div
              key={tierKey}
              className={`glass rounded-xl p-6 ${
                isCurrent ? "ring-2 ring-primary-600" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    tierKey === "FREE"
                      ? "bg-dark-100"
                      : tierKey === "BASIC"
                      ? "bg-primary-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {getTierIcon(tierKey)}
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">{tier.name}</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    {tier.price === 0 ? "Free" : `₹${tier.price}/mo`}
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-dark-700"
                  >
                    <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {canUpgrade && (
                <button
                  onClick={() => handleUpgrade(tierKeyTyped)}
                  disabled={isProcessing || selectedTier === tierKeyTyped}
                  className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing && selectedTier === tierKeyTyped
                    ? "Processing..."
                    : `Upgrade to ${tier.name}`}
                </button>
              )}

              {isCurrent && (
                <div className="w-full bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold text-center">
                  Current Plan
                </div>
              )}

              {tierKey === "FREE" && !isCurrent && (
                <button
                  onClick={handleActivateFree}
                  disabled={isActivatingFree}
                  className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActivatingFree ? "Activating..." : "Activate Free Plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
