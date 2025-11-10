import { useCallback, useEffect, useMemo, useState, useId } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCarByIdQuery } from "../services/carApi";
import { useCreatePurchaseMutation } from "../services/purchaseApi";
import {
  useCreatePurchaseOrderMutation,
  useVerifyPurchasePaymentMutation,
} from "../services/paymentApi";
import type { StripePaymentIntentResponse } from "../services/paymentApi";
import { useGetDealsQuery } from "../services/dealsApi";
import Navbar from "../components/layout/Navbar";
import StripePayment from "../components/payment/StripePayment";
import {
  DollarSign,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Calculator,
  AlertTriangle,
  Handshake,
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
  const { data: dealsData } = useGetDealsQuery(
    undefined,
    {
      skip: !id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

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
  const [priceConfirmed, setPriceConfirmed] = useState(false);
  const priceConfirmationId = useId();

  const car = carData?.car;
  const relevantDeals = useMemo(() => {
    if (!dealsData?.deals || !id) {
      return [];
    }
    return dealsData.deals.filter(
      (deal) => deal.carId === id && deal.dealType === "PURCHASE"
    );
  }, [dealsData?.deals, id]);

  const acceptedDeal = useMemo(
    () => relevantDeals.find((deal) => deal.status === "ACCEPTED"),
    [relevantDeals]
  );
  const pendingDeal = useMemo(
    () => relevantDeals.find((deal) => deal.status === "PENDING"),
    [relevantDeals]
  );
  const rejectedDeal = useMemo(
    () => relevantDeals.find((deal) => deal.status === "REJECTED"),
    [relevantDeals]
  );
  const completedDeal = useMemo(
    () => relevantDeals.find((deal) => deal.status === "COMPLETED"),
    [relevantDeals]
  );

  const existingPurchaseId =
    acceptedDeal?.purchase && acceptedDeal.purchase.paymentStatus !== "PAID"
      ? acceptedDeal.purchase.id
      : null;
  const isDealPaymentCompleted =
    acceptedDeal?.purchase?.paymentStatus === "PAID";

  const updateFeesForPrice = useCallback((priceNum: number) => {
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setCalculatedFees(null);
      return;
    }

    const normalizedPrice = Math.round(priceNum * 100) / 100;
    const platformFeePercentage = 5; // TODO: fetch from platform fee API when available
    const rawFee = (normalizedPrice * platformFeePercentage) / 100;
    const platformFee = Math.round(rawFee * 100) / 100;
    const sellerEarnings =
      Math.round((normalizedPrice - platformFee) * 100) / 100;

    setCalculatedFees({
      platformFee,
      sellerEarnings,
      totalAmount: normalizedPrice,
    });
  }, []);

  useEffect(() => {
    if (existingPurchaseId && purchaseId !== existingPurchaseId) {
      setPurchaseId(existingPurchaseId);
    }
  }, [existingPurchaseId, purchaseId]);

  useEffect(() => {
    setPriceConfirmed(false);
  }, [acceptedDeal?.id]);

  useEffect(() => {
    if (acceptedDeal) {
      const priceString = acceptedDeal.agreedPrice.toString();
      if (salePrice !== priceString) {
        setSalePrice(priceString);
      }

      if (
        typeof acceptedDeal.purchase?.platformFee === "number" &&
        typeof acceptedDeal.purchase?.sellerEarnings === "number"
      ) {
        setCalculatedFees({
          platformFee: acceptedDeal.purchase.platformFee,
          sellerEarnings: acceptedDeal.purchase.sellerEarnings!,
          totalAmount: acceptedDeal.agreedPrice,
        });
      } else {
        updateFeesForPrice(acceptedDeal.agreedPrice);
      }

      setError("");
      return;
    }

    if (pendingDeal && !salePrice) {
      const pendingPrice = pendingDeal.agreedPrice.toString();
      setSalePrice(pendingPrice);
      updateFeesForPrice(pendingDeal.agreedPrice);
    }
  }, [acceptedDeal, pendingDeal, salePrice, updateFeesForPrice]);

  const handlePriceChange = (price: string) => {
    setSalePrice(price);
    setError("");
    setPriceConfirmed(false);

    const priceNum = parseFloat(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setCalculatedFees(null);
      return;
    }

    updateFeesForPrice(priceNum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!acceptedDeal) {
      setError(
        "You need a seller-confirmed deal before proceeding to payment. Please confirm the price with the seller in chat."
      );
      return;
    }

    if (!priceConfirmed) {
      setError("Please confirm the agreed deal price before continuing to payment.");
      return;
    }

    if (isDealPaymentCompleted) {
      setError(
        "This deal has already been paid for. You can review it from your dashboard."
      );
      return;
    }

    let activePurchaseId = purchaseId ?? existingPurchaseId;
    const confirmedPrice = acceptedDeal.agreedPrice;

    try {
      if (!activePurchaseId) {
        if (
          car?.salePrice &&
          (confirmedPrice < car.salePrice * 0.5 ||
            confirmedPrice > car.salePrice * 1.5)
        ) {
          const proceed = await confirm({
            title: "Confirm Price Difference",
            message: `The confirmed deal price is ₹${confirmedPrice.toLocaleString()} which is significantly different from the listed price of ₹${car.salePrice.toLocaleString()}. Continue to payment?`,
            confirmLabel: "Continue",
            cancelLabel: "Review Deal",
            variant: "warning",
          });

          if (!proceed) {
            return;
          }
        }

        const result = await createPurchase({
          carId: id!,
          salePrice: confirmedPrice,
        }).unwrap();

        activePurchaseId = result.purchase.id;
        setPurchaseId(result.purchase.id);

        if (
          result.purchase.platformFee != null &&
          result.purchase.sellerEarnings != null
        ) {
          setCalculatedFees({
            platformFee: result.purchase.platformFee,
            sellerEarnings: result.purchase.sellerEarnings,
            totalAmount: result.purchase.salePrice,
          });
        } else {
          updateFeesForPrice(result.purchase.salePrice);
        }

        setSuccess(true);
      }

      if (!activePurchaseId) {
        setError(
          "Unable to determine the purchase reference. Please try again or contact support."
        );
        return;
      }

      try {
        if (paymentOrder && purchaseId === activePurchaseId) {
          setSuccess(true);
          return;
        }

        const paymentResult = await createPurchaseOrder({
          purchaseId: activePurchaseId,
        }).unwrap();

        setPaymentOrder(paymentResult);
        setSuccess(true);
      } catch (orderErr) {
        const message = getApiErrorMessage(
          orderErr,
          "Failed to create payment order. Purchase exists but payment could not be initiated."
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
                    readOnly={!!acceptedDeal}
                    placeholder={
                      car.salePrice
                        ? `e.g., ${car.salePrice.toLocaleString()}`
                        : "Enter price"
                    }
                    min="1"
                    step="1"
                    required
                    className={`w-full px-4 py-3 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-semibold ${
                      acceptedDeal ? "bg-dark-100 cursor-not-allowed text-dark-700" : ""
                    }`}
                  />
                  {car.salePrice && (
                    <p className="text-xs text-dark-500 mt-1">
                      Listed price: ₹{car.salePrice.toLocaleString()}
                    </p>
                  )}
                </div>

                {acceptedDeal ? (
                  <div className="space-y-3 rounded-lg border border-success-200 bg-success-50 p-4">
                    <div className="flex gap-3">
                      <Handshake className="mt-0.5 h-5 w-5 text-success-600" />
                      <div>
                        <p className="font-semibold text-success-900">
                          Deal confirmed with {acceptedDeal.seller.name}
                        </p>
                        <p className="text-sm text-success-700">
                          Final agreed price: ₹
                          {acceptedDeal.agreedPrice.toLocaleString()}.
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor={priceConfirmationId}
                      className="flex items-start gap-3 rounded-md border border-success-200 bg-white/80 px-4 py-3 text-sm text-dark-700 shadow-sm"
                    >
                      <input
                        id={priceConfirmationId}
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                        checked={priceConfirmed}
                        onChange={(event) => {
                          setPriceConfirmed(event.target.checked);
                          if (error) {
                            setError("");
                          }
                        }}
                      />
                      <span className="leading-5">
                        I confirm that I have reviewed and agreed to pay the deal
                        price of ₹{acceptedDeal.agreedPrice.toLocaleString()} before
                        proceeding to payment.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-600" />
                    <div>
                      <p className="font-semibold text-warning-900">
                        Waiting for price confirmation
                      </p>
                      <p className="text-sm text-warning-700">
                        Head back to chat, agree on the price, and create a deal from the
                        chat window. Once the seller accepts that deal price, it will show
                        up here so you can confirm it and continue to payment.
                      </p>
                    </div>
                  </div>
                )}

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
                    disabled={
                      isCreating ||
                      !salePrice ||
                      isCreatingOrder ||
                      !acceptedDeal ||
                      !priceConfirmed
                    }
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
