import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCarByIdQuery } from "../services/carApi";
import { useCreatePurchaseMutation } from "../services/purchaseApi";
import {
  useCreatePurchaseOrderMutation,
  useVerifyPurchasePaymentMutation,
} from "../services/paymentApi";
import type { StripePaymentIntentResponse } from "../services/paymentApi";
import Navbar from "../components/layout/Navbar";
import StripePayment from "../components/payment/StripePayment";
import {
  DollarSign,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Calculator,
} from "lucide-react";
import { useConfirm } from "../components/common/ConfirmProvider";
import { getApiErrorMessage } from "../utils/error";

const PurchaseBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: carData, isLoading: carLoading } = useGetCarByIdQuery(id!);
  const [createPurchase, { isLoading: isCreating }] =
    useCreatePurchaseMutation();
  const [createPurchaseOrder, { isLoading: isCreatingOrder }] =
    useCreatePurchaseOrderMutation();
  const [verifyPayment] = useVerifyPurchasePaymentMutation();
  const confirm = useConfirm();

  const [salePrice, setSalePrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] =
    useState<StripePaymentIntentResponse | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [calculatedFees, setCalculatedFees] = useState<{
    platformFee: number;
    sellerEarnings: number;
    totalAmount: number;
  } | null>(null);

  const car = carData?.car;

  const handlePriceChange = async (price: string) => {
    setSalePrice(price);
    setError("");

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setCalculatedFees(null);
      return;
    }

    // Calculate platform fee (default 5%)
    const platformFeePercentage = 5; // This should ideally come from API
    const platformFee = (priceNum * platformFeePercentage) / 100;
    const sellerEarnings = priceNum - platformFee;
    const totalAmount = priceNum;

    setCalculatedFees({
      platformFee,
      sellerEarnings,
      totalAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!salePrice || parseFloat(salePrice) <= 0) {
      setError("Please enter a valid sale price");
      return;
    }

    if (!car?.salePrice) {
      setError("Car sale price not available");
      return;
    }

    const priceNum = parseFloat(salePrice);
    if (priceNum < car.salePrice * 0.5 || priceNum > car.salePrice * 1.5) {
      const proceed = await confirm({
        title: "Confirm Price Difference",
        message: `The entered price (₹${priceNum.toLocaleString()}) is significantly different from the listed price (₹${car.salePrice.toLocaleString()}). Continue?`,
        confirmLabel: "Continue",
        cancelLabel: "Review Price",
        variant: "warning",
      });

      if (!proceed) {
        return;
      }
    }

    try {
      const result = await createPurchase({
        carId: id!,
        salePrice: priceNum,
      }).unwrap();

      setPurchaseId(result.purchase.id);

      // Use calculated fees from purchase response
      if (result.purchase.platformFee && result.purchase.sellerEarnings) {
        setCalculatedFees({
          platformFee: result.purchase.platformFee,
          sellerEarnings: result.purchase.sellerEarnings,
          totalAmount: result.purchase.salePrice,
        });
      }

      // Create Stripe payment intent
      try {
        const paymentResult = await createPurchaseOrder({
          purchaseId: result.purchase.id,
        }).unwrap();

        setPaymentOrder(paymentResult);
        setSuccess(true);
      } catch (orderErr) {
        const message = getApiErrorMessage(
          orderErr,
          "Failed to create payment order. Purchase created but payment failed."
        );
        setError(message);
        setSuccess(true); // Purchase is still created
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create purchase");
      setError(message);
    }
  };

  if (carLoading) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-dark-600">Loading car details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!car || !car.isForSale) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-xl text-dark-600 mb-4">
              Car not found or not available for sale
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-600 hover:text-dark-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="glass rounded-xl p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Purchase: {car.brand} {car.model}
          </h1>
          <p className="text-dark-600 mb-6">Complete your purchase</p>

          {success && !paymentOrder && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-success-900">
                  Purchase Created Successfully!
                </p>
                <p className="text-sm text-success-700 mt-1">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
              <p className="text-error-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Car Summary */}
            <div className="bg-dark-50 rounded-lg p-6">
              <h3 className="font-semibold text-dark-900 mb-4">Car Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark-600 mb-1">Car</p>
                  <p className="font-semibold text-dark-900">
                    {car.brand} {car.model} ({car.year})
                  </p>
                </div>
                {car.salePrice && (
                  <div>
                    <p className="text-sm text-dark-600 mb-1">Listed Price</p>
                    <p className="font-semibold text-primary-600">
                      ₹{car.salePrice.toLocaleString()}
                    </p>
                  </div>
                )}
                {car.seller && (
                  <div>
                    <p className="text-sm text-dark-600 mb-1">Seller</p>
                    <p className="font-semibold text-dark-900">
                      {car.seller.name}
                    </p>
                  </div>
                )}
                {car.city && (
                  <div>
                    <p className="text-sm text-dark-600 mb-1">Location</p>
                    <p className="font-semibold text-dark-900">{car.city}</p>
                  </div>
                )}
                {typeof car.ownersCount === "number" && (
                  <div>
                    <p className="text-sm text-dark-600 mb-1">
                      Number of Owners
                    </p>
                    <p className="font-semibold text-dark-900">
                      {car.ownersCount}{" "}
                      {car.ownersCount === 1 ? "owner" : "owners"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!paymentOrder ? (
              <>
                {/* Price Input */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Agreed Sale Price
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder={
                      car.salePrice
                        ? `e.g., ${car.salePrice.toLocaleString()}`
                        : "Enter price"
                    }
                    min="1"
                    step="1"
                    required
                    className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-semibold"
                  />
                  {car.salePrice && (
                    <p className="text-xs text-dark-500 mt-1">
                      Listed price: ₹{car.salePrice.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Fee Breakdown */}
                {calculatedFees && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                    <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Fee Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-dark-600">Sale Price</span>
                        <span className="font-semibold text-dark-900">
                          ₹{calculatedFees.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-600">Platform Fee (5%)</span>
                        <span className="font-semibold text-primary-600">
                          ₹{calculatedFees.platformFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-primary-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-dark-900">
                            Seller Earnings
                          </span>
                          <span className="text-lg font-bold text-success-600">
                            ₹{calculatedFees.sellerEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-primary-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-dark-900">
                            Total Amount to Pay
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            ₹{calculatedFees.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-6 py-3 border-2 border-dark-300 text-dark-700 font-semibold rounded-lg hover:bg-dark-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !salePrice || isCreatingOrder}
                    className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating || isCreatingOrder
                      ? "Processing..."
                      : "Confirm Purchase"}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary-900">
                        Purchase Created Successfully!
                      </p>
                      <p className="text-sm text-primary-700 mt-1">
                        Please complete the payment to confirm your purchase.
                      </p>
                    </div>
                  </div>
                </div>

                {calculatedFees && (
                  <div className="bg-dark-50 rounded-lg p-6">
                    <h3 className="font-semibold text-dark-900 mb-4">
                      Payment Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-dark-600">Sale Price</span>
                        <span className="font-semibold text-dark-900">
                          ₹{calculatedFees.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-600">Platform Fee</span>
                        <span className="font-semibold text-primary-600">
                          ₹{calculatedFees.platformFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-dark-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-dark-900">
                            Total
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            ₹{calculatedFees.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-dark-200 pt-4">
                  <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                  </h3>
                  <StripePayment
                    clientSecret={paymentOrder.clientSecret}
                    publishableKey={paymentOrder.publishableKey}
                    amount={
                      calculatedFees
                        ? calculatedFees.totalAmount * 100
                        : parseFloat(salePrice) * 100
                    }
                    onSuccess={async (paymentIntentId) => {
                      if (isProcessingPayment) {
                        return;
                      }
                      setIsProcessingPayment(true);
                      setError("");
                      try {
                        await verifyPayment({
                          purchaseId: purchaseId!,
                          paymentIntentId,
                        }).unwrap();

                        setSuccess(true);
                        setError("");
                        setTimeout(() => {
                          navigate("/dashboard", { replace: true });
                        }, 1500);
                      } catch (err) {
                        const errorMessage = getApiErrorMessage(
                          err,
                          "Payment verification failed"
                        );
                        setError(errorMessage);
                        setIsProcessingPayment(false);
                      }
                    }}
                    onError={(err) => {
                      const message = getApiErrorMessage(err, "Payment failed");
                      setError(message);
                      setIsProcessingPayment(false);
                    }}
                  />
                </div>

                <div className="bg-dark-50 border border-dark-200 rounded-lg p-4">
                  <p className="text-sm text-dark-600 text-center">
                    Payment must be completed to finalize your purchase. You can
                    complete it later from your dashboard.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full mt-3 px-4 py-2 border border-dark-300 text-dark-700 text-sm font-medium rounded-lg hover:bg-dark-100 transition"
                  >
                    Complete Payment Later (From Dashboard)
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBooking;
