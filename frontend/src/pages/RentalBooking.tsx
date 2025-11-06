import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCarByIdQuery,
  useGetUnavailableDatesQuery,
} from "../services/carApi";
import { useCreateRentalMutation } from "../services/rentalApi";
import {
  useCreateRentalOrderMutation,
  useVerifyRentalPaymentMutation,
} from "../services/paymentApi";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import StripePayment from "../components/payment/StripePayment";
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  XCircle,
  CreditCard,
} from "lucide-react";

const RentalBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: carData, isLoading: carLoading } = useGetCarByIdQuery(id!);
  const { data: unavailableDatesData } = useGetUnavailableDatesQuery(id!);
  const [createRental, { isLoading: isCreating }] = useCreateRentalMutation();
  const [createRentalOrder, { isLoading: isCreatingOrder }] =
    useCreateRentalOrderMutation();
  const [verifyPayment] = useVerifyRentalPaymentMutation();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rentalId, setRentalId] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const car = carData?.car;
  const allUnavailableDates = unavailableDatesData?.unavailableDates || [];

  // Filter out past dates - only show future unavailable dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unavailableDates = allUnavailableDates.filter((dateStr) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  });

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateTotal = () => {
    if (!car?.rentalPrice) return 0;
    return car.rentalPrice * calculateDays();
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // If car has next available date, check if it's today or in the past
    if (car?.availability?.nextAvailableDate) {
      const nextAvailable = new Date(car.availability.nextAvailableDate);
      nextAvailable.setHours(0, 0, 0, 0);
      // If nextAvailable is today or in the past, allow booking from today
      if (nextAvailable <= today) {
        return today.toISOString().split("T")[0];
      }
      // If nextAvailable is in the future, use that date
      return nextAvailable.toISOString().split("T")[0];
    }
    return today.toISOString().split("T")[0];
  };

  const isDateBooked = (dateStr: string): boolean => {
    // Check unavailable dates from API
    if (unavailableDates.includes(dateStr)) return true;

    // Also check booked dates from availability info
    if (!car?.availability?.bookedDates) return false;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    return car.availability.bookedDates.some((period) => {
      const start = new Date(period.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(period.endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  const isDateRangeAvailable = (start: string, end: string): boolean => {
    if (!start || !end) return true;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!car?.availability?.bookedDates) return true;

    // Check if any date in the range is booked
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isDateBooked(d.toISOString().split("T")[0])) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (!isDateRangeAvailable(startDate, endDate)) {
      setError(
        "Selected date range includes booked dates. Please select different dates."
      );
      return;
    }

    if (!user?.isAadhaarVerified) {
      setError("Please verify your Aadhaar before booking a rental car");
      return;
    }

    try {
      const result = await createRental({
        carId: id!,
        startDate,
        endDate,
      }).unwrap();

      setRentalId(result.rental.id);

      // Create Stripe payment intent
      try {
        const paymentResult = await createRentalOrder({
          rentalId: result.rental.id,
        }).unwrap();

        setPaymentOrder(paymentResult);
        setSuccess(true);
      } catch (orderErr: any) {
        setError(
          orderErr?.data?.error ||
            "Failed to create payment order. Booking created but payment failed."
        );
        setSuccess(true); // Booking is still created
      }
    } catch (err: any) {
      setError(err?.data?.error || "Failed to create rental booking");
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

  if (!car || !car.isForRent) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-xl text-dark-600 mb-4">
              Car not found or not available for rent
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
            Book Rental: {car.brand} {car.model}
          </h1>
          <p className="text-dark-600 mb-6">Select your rental dates</p>

          {!user?.isAadhaarVerified && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning-900">
                  Aadhaar Verification Required
                </p>
                <p className="text-sm text-warning-700 mt-1">
                  Please verify your Aadhaar document before booking a rental
                  car. Contact admin for verification.
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-success-900">
                  Booking Created Successfully!
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (isDateBooked(selectedDate)) {
                      setError(
                        "This date is already booked. Please select another date."
                      );
                      return;
                    }
                    setStartDate(selectedDate);
                    setError("");
                    if (endDate && selectedDate > endDate) {
                      setEndDate("");
                    } else if (
                      endDate &&
                      !isDateRangeAvailable(selectedDate, endDate)
                    ) {
                      setEndDate("");
                      setError(
                        "Selected date range includes booked dates. Please select different dates."
                      );
                    }
                  }}
                  min={getMinDate()}
                  required
                  className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-dark-100 disabled:cursor-not-allowed"
                  disabled={
                    unavailableDates.length > 0 &&
                    unavailableDates.some((d) => d === getMinDate())
                  }
                />
                {car?.availability?.nextAvailableDate &&
                  !startDate &&
                  (() => {
                    const nextAvailable = new Date(
                      car.availability.nextAvailableDate
                    );
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    nextAvailable.setHours(0, 0, 0, 0);
                    // Only show if the date is in the future
                    if (nextAvailable > today) {
                      return (
                        <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Available after{" "}
                          {nextAvailable.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      );
                    }
                    return null;
                  })()}
                {unavailableDates.length > 0 && (
                  <p className="text-xs text-dark-500 mt-1">
                    {unavailableDates.length} upcoming booked date
                    {unavailableDates.length > 1 ? "s" : ""} excluded from
                    selection
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (isDateBooked(selectedDate)) {
                      setError(
                        "This date is already booked. Please select another date."
                      );
                      return;
                    }
                    if (
                      startDate &&
                      !isDateRangeAvailable(startDate, selectedDate)
                    ) {
                      setError(
                        "Selected date range includes booked dates. Please select different dates."
                      );
                      return;
                    }
                    setEndDate(selectedDate);
                    setError("");
                  }}
                  min={startDate || getMinDate()}
                  required
                  className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {startDate &&
                  !endDate &&
                  car?.availability?.bookedDates.length > 0 && (
                    <p className="text-xs text-warning-600 mt-1">
                      Please ensure your dates don't overlap with booked periods
                    </p>
                  )}
              </div>
            </div>

            {startDate && endDate && (
              <div className="bg-dark-50 rounded-lg p-6">
                <h3 className="font-semibold text-dark-900 mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dark-600">Car:</span>
                    <span className="font-semibold text-dark-900">
                      {car.brand} {car.model} ({car.year})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Daily Rate:</span>
                    <span className="font-semibold text-dark-900">
                      ₹{car.rentalPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Total Days:</span>
                    <span className="font-semibold text-dark-900">
                      {calculateDays()} days
                    </span>
                  </div>
                  <div className="border-t border-dark-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-dark-900">
                        Total Amount:
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!paymentOrder ? (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border-2 border-dark-300 text-dark-700 font-semibold rounded-lg hover:bg-dark-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    !startDate ||
                    !endDate ||
                    !user?.isAadhaarVerified
                  }
                  className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isCreatingOrder
                    ? "Processing..."
                    : "Confirm Booking"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary-900">
                        Booking Created Successfully!
                      </p>
                      <p className="text-sm text-primary-700 mt-1">
                        Please complete the payment to confirm your booking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dark-200 pt-4">
                  <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                  </h3>
                  <StripePayment
                    clientSecret={paymentOrder.clientSecret}
                    publishableKey={paymentOrder.publishableKey}
                    amount={calculateTotal() * 100}
                    onSuccess={async (paymentIntentId) => {
                      if (isProcessingPayment) {
                        return;
                      }
                      setIsProcessingPayment(true);
                      setError("");
                      try {
                        await verifyPayment({
                          rentalId: rentalId!,
                          paymentIntentId,
                        }).unwrap();

                        setSuccess(true);
                        setTimeout(() => {
                          navigate("/dashboard");
                        }, 1500);
                      } catch (err: any) {
                        setError(
                          err?.data?.error ||
                            err?.data?.details ||
                            "Payment verification failed"
                        );
                        setIsProcessingPayment(false);
                      }
                    }}
                    onError={(err) => {
                      setError(err?.message || "Payment failed");
                      setIsProcessingPayment(false);
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentalBooking;
