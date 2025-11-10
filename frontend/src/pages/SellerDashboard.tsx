import { useState } from "react";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import {
  useGetSellerCarsQuery,
  useGetSellerStatsQuery,
  useDeleteSellerCarMutation,
  type Car,
} from "../services/carApi";
import {
  Car as CarIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Crown,
  Handshake,
  MessageCircle,
  ShieldAlert,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import StatCard from "../components/common/StatCard";
import { useToast } from "../components/common/ToastContainer";
import { useConfirm } from "../components/common/ConfirmProvider";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { Link } from "react-router-dom";
import SubscriptionManagement from "../components/seller/SubscriptionManagement";
import AddSellerCarModal from "../components/seller/AddSellerCarModal";
import EditSellerCarModal from "../components/seller/EditSellerCarModal";
import DealStatusBadge from "../components/deals/DealStatusBadge";
import {
  useGetDealsQuery,
  useUpdateDealStatusMutation,
} from "../services/dealsApi";
import { useGetRentalsQuery } from "../services/rentalApi";
import { useGetShopsByCityQuery } from "../services/shopApi";
import { getApiErrorMessage } from "../utils/error";

const PickupAddress: React.FC<{ city?: string }> = ({ city }) => {
  const { data } = useGetShopsByCityQuery(
    { city: city || undefined },
    { skip: !city }
  );
  if (!city) return null;
  const shop = data?.shops?.[0];
  const address = shop?.addressLine
    ? `${shop.addressLine}${shop.landmark ? ", " + shop.landmark : ""}${
        shop.pincode ? " - " + shop.pincode : ""
      }`
    : city;
  return (
    <span className="font-medium text-dark-900 break-words">
      {address}
      {(shop?.phone || shop?.hoursStart || shop?.hoursEnd) && (
        <span className="block text-xs text-dark-500 mt-1 space-y-1">
          {shop?.phone && <span className="block">Contact: {shop.phone}</span>}
          {(shop?.hoursStart || shop?.hoursEnd) && (
            <span className="block">
              Hours: {shop?.hoursStart ?? "--"} – {shop?.hoursEnd ?? "--"}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

const SellerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<
    "listings" | "subscription" | "deals" | "rentals"
  >("listings");

  const { data, isLoading } = useGetSellerCarsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { data: statsData } = useGetSellerStatsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { data: dealsData, isFetching: isDealsLoading } = useGetDealsQuery(
    undefined,
    {
      skip: activeTab !== "deals",
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: rentalsData, isFetching: isRentalsLoading } =
    useGetRentalsQuery(undefined);
  const [deleteCar] = useDeleteSellerCarMutation();
  const [updateDealStatus] = useUpdateDealStatusMutation();
  const [respondingDealId, setRespondingDealId] = useState<string | null>(null);

  const cars = data?.cars || [];
  const stats = statsData?.stats;
  const deals = dealsData?.deals || [];
  const rentals = rentalsData?.rentals || [];
  const { showSuccess, showError, showInfo } = useToast();
  const confirm = useConfirm();
  const isSellerVerified = Boolean(user?.isAadhaarVerified);

  const handleDeleteClick = async (car: Car) => {
    const confirmed = await confirm({
      title: "Delete Car Listing",
      message: `Are you sure you want to delete "${car.brand} ${car.model}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteCar(car.id).unwrap();
      showSuccess("Car listing deleted successfully");
    } catch (error) {
      console.error("Failed to delete car:", error);
      const fallbackMessage =
        (error as { data?: { error?: string } })?.data?.error ||
        "Failed to delete car. Please try again.";
      showError(fallbackMessage);
    }
  };

  const handleDealResponse = async (
    dealId: string,
    status: "ACCEPTED" | "REJECTED",
    agreedPrice: number,
    carLabel: string
  ) => {
    const actionLabel = status === "ACCEPTED" ? "Accept" : "Reject";
    const userConfirmed = await confirm({
      title:
        status === "ACCEPTED"
          ? "Accept Deal Price"
          : "Reject Deal Price",
      message:
        status === "ACCEPTED"
          ? `Confirm you want to accept the ₹${agreedPrice.toLocaleString()} offer for ${carLabel}. This will allow the buyer to proceed to payment.`
          : "Rejecting will notify the buyer and close this deal. Are you sure?",
      confirmLabel: actionLabel,
      cancelLabel: "Cancel",
      variant: status === "ACCEPTED" ? "info" : "danger",
    });

    if (!userConfirmed) {
      return;
    }

    try {
      setRespondingDealId(dealId);
      await updateDealStatus({ id: dealId, status }).unwrap();
      showSuccess(
        status === "ACCEPTED"
          ? "Deal accepted successfully. The buyer can now proceed to payment."
          : "Deal rejected. Let the buyer know if you want to renegotiate."
      );
    } catch (error) {
      const fallback = getApiErrorMessage(
        error,
        `Failed to ${actionLabel.toLowerCase()} the deal. Please try again.`
      );
      showError(fallback);
    } finally {
      setRespondingDealId(null);
    }
  };

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Seller Dashboard" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-dark-600">
            Welcome,{" "}
            <span className="font-semibold text-primary">{user?.name}</span>!
            Manage your pre-owned car listings.
          </p>
        </div>

        {!isSellerVerified && (
          <div className="mb-8 rounded-2xl border border-warning-300 bg-warning-50 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-warning-200 p-2 text-warning-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark-900">
                  Verify your Aadhaar to start listing cars
                </h2>
                <p className="text-sm text-dark-700 mt-1">
                  For compliance and buyer safety, seller accounts must complete
                  Aadhaar verification before creating or editing listings.
                </p>
              </div>
            </div>
            <Link
              to="/verify-aadhaar"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-warning-600 px-5 py-2 font-semibold text-white transition hover:bg-warning-700"
            >
              Verify Aadhaar
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Listings"
              value={stats.totalCars}
              icon={CarIcon}
              color="primary"
            />
            <StatCard
              title="Available"
              value={stats.availableCars}
              icon={CheckCircle}
              color="success"
            />
            <StatCard
              title="Sold"
              value={stats.soldCars}
              icon={XCircle}
              color="info"
            />
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue || 0}
              icon={TrendingUp}
              color="success"
              prefix="₹"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-dark-200 pb-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeTab === "listings"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-dark-600 hover:text-dark-900"
            }`}
          >
            <CarIcon className="w-4 h-4 inline mr-2" />
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeTab === "subscription"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-dark-600 hover:text-dark-900"
            }`}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            Subscription
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeTab === "deals"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-dark-600 hover:text-dark-900"
            }`}
          >
            <Handshake className="w-4 h-4 inline mr-2" />
            My Deals
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeTab === "rentals"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-dark-600 hover:text-dark-900"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            My Rentals
          </button>
          <Link
            to="/chat"
            className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Messages
          </Link>
        </div>

        {/* Subscription Tab */}
        {activeTab === "subscription" && <SubscriptionManagement />}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div>
            <h2 className="text-2xl font-bold text-dark-900 mb-6">My Deals</h2>
            {isDealsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-dark-600">Loading your deals...</p>
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl">
                <Handshake className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                <p className="text-xl text-dark-600 mb-2">No deals yet</p>
                <p className="text-dark-500">
                  Deals will appear here when buyers initiate them from chats
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => {
                  const isSeller = user?.id === deal.seller.id;
                  const isPending = deal.status === "PENDING";
                  const isResponding = respondingDealId === deal.id;
                  const carLabel = `${deal.car.brand} ${deal.car.model} (${deal.car.year})`;
                  return (
                    <div key={deal.id} className="glass rounded-xl p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {deal.car.primaryImage && (
                          <img
                            src={deal.car.primaryImage}
                            alt={`${deal.car.brand} ${deal.car.model}`}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-dark-900">
                            {deal.car.brand} {deal.car.model} ({deal.car.year})
                          </h3>
                          <p className="text-sm text-dark-600">
                            Deal with {deal.buyer.name}
                          </p>
                          <p className="text-sm text-dark-600">
                            {deal.dealType === "PURCHASE"
                              ? "Purchase"
                              : "Rental"}{" "}
                            Deal
                          </p>
                        </div>
                      </div>
                      <div className="md:self-start">
                        <DealStatusBadge status={deal.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-dark-200">
                      <div>
                        <p className="text-sm text-dark-600 mb-1">
                          Agreed Price
                        </p>
                        <p className="font-semibold text-dark-900">
                          ₹{deal.agreedPrice.toLocaleString()}
                        </p>
                      </div>
                      {deal.purchase?.platformFee && (
                        <>
                          <div>
                            <p className="text-sm text-dark-600 mb-1">
                              Platform Fee
                            </p>
                            <p className="font-semibold text-primary-600">
                              ₹{deal.purchase.platformFee.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-dark-600 mb-1">
                              Your Earnings
                            </p>
                            <p className="font-semibold text-success-600">
                              ₹
                              {deal.purchase.sellerEarnings?.toLocaleString() ||
                                "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-sm text-dark-600 mb-1">Date</p>
                        <p className="font-semibold text-dark-900">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isSeller && (
                        <div className="sm:col-span-2 lg:col-span-1">
                          <p className="text-sm text-dark-600 mb-1">
                            Buyer
                          </p>
                          <p className="font-semibold text-dark-900">
                            {deal.buyer.name}
                          </p>
                        </div>
                      )}
                      {deal.status === "ACCEPTED" &&
                        isSeller &&
                        !deal.purchase && (
                          <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-primary-200 bg-primary-50 p-4">
                            <p className="text-sm text-primary-800">
                              You accepted this deal. The buyer can now complete
                              payment from their dashboard. Keep an eye on your
                              inbox for payment confirmation.
                            </p>
                          </div>
                        )}
                      {isPending && isSeller && (
                        <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDealResponse(
                                deal.id,
                                "REJECTED",
                                deal.agreedPrice,
                                carLabel
                              )
                            }
                            disabled={isResponding}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 border-error-200 text-error-700 font-semibold hover:bg-error-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isResponding && (
                              <span className="inline-block h-4 w-4 border-2 border-t-transparent border-error-500 rounded-full animate-spin mr-2 align-middle" />
                            )}
                            Reject Price
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDealResponse(
                                deal.id,
                                "ACCEPTED",
                                deal.agreedPrice,
                                carLabel
                              )
                            }
                            disabled={isResponding}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isResponding && (
                              <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2 align-middle" />
                            )}
                            Accept Price
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === "rentals" && (
          <div>
            <h2 className="text-2xl font-bold text-dark-900 mb-6">
              My Rental Bookings
            </h2>
            {isRentalsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-dark-600">Loading your rentals...</p>
              </div>
            ) : rentals.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl">
                <Calendar className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                <p className="text-xl text-dark-600 mb-2">No rentals yet</p>
                <p className="text-dark-500">
                  Rent a vehicle from the catalogue to see bookings here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => {
                  const start = new Date(rental.startDate);
                  const end = new Date(rental.endDate);
                  return (
                    <div key={rental.id} className="glass rounded-xl p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          {rental.car.primaryImage && (
                            <img
                              src={rental.car.primaryImage}
                              alt={`${rental.car.brand} ${rental.car.model}`}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-bold text-dark-900 text-lg">
                              {rental.car.brand} {rental.car.model} (
                              {rental.car.year})
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-dark-600 mt-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {start.toLocaleDateString()} -{" "}
                                {end.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-dark-600 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {rental.totalDays}{" "}
                                {rental.totalDays === 1 ? "day" : "days"}
                              </span>
                            </div>
                            {rental.car.city && (
                              <div className="flex items-center gap-2 text-sm text-dark-600 mt-1">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <span>
                                  Pickup Location:{" "}
                                  <PickupAddress city={rental.car.city} />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-sm text-dark-600">
                              Total Amount
                            </p>
                            <p className="text-2xl font-bold text-primary-600">
                              ₹{rental.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              rental.status === "COMPLETED"
                                ? "bg-success-100 text-success-700"
                                : rental.status === "ACTIVE"
                                ? "bg-primary-100 text-primary-700"
                                : rental.status === "PENDING"
                                ? "bg-warning-100 text-warning-700"
                                : "bg-error-100 text-error-700"
                            }`}
                          >
                            {rental.status}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              rental.paymentStatus === "PAID"
                                ? "bg-success-100 text-success-700"
                                : rental.paymentStatus === "PENDING"
                                ? "bg-warning-100 text-warning-700"
                                : "bg-error-100 text-error-700"
                            }`}
                          >
                            {rental.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <>
            {/* Actions */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-dark-900">
                  My Car Listings
                </h2>
                <p className="text-dark-600">
                  Manage your pre-owned vehicles for sale
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={!isSellerVerified}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2 ${
                  isSellerVerified
                    ? "bg-gradient-primary hover:bg-gradient-primary-dark text-white"
                    : "bg-dark-300 text-dark-500 cursor-not-allowed"
                }`}
                title={
                  isSellerVerified
                    ? "Add a new car listing"
                    : "Complete Aadhaar verification to add listings"
                }
              >
                <Plus className="w-5 h-5" />
                Add New Car
              </button>
            </div>

            {/* Cars Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-dark-600">Loading your listings...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl">
                <CarIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                <p className="text-xl text-dark-600 mb-2">No cars listed yet</p>
                <p className="text-dark-500 mb-6">
                  Start selling by adding your first car!
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                  Add Your First Car
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {car.primaryImage && (
                      <div className="relative w-full h-64 overflow-hidden">
                        <img
                          src={car.primaryImage}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                        {car.images && car.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-semibold">
                            +{car.images.length - 1} more
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              car.status === "AVAILABLE"
                                ? "bg-success-600 text-white"
                                : car.status === "SOLD"
                                ? "bg-dark-600 text-white"
                                : "bg-warning-600 text-white"
                            }`}
                          >
                            {car.status}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-dark-900">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-sm text-dark-600">{car.year}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">
                            ₹{car.salePrice?.toLocaleString() || "N/A"}
                          </p>
                          <p className="text-xs text-dark-500">Sale Price</p>
                        </div>
                      </div>

                      {car.city && (
                        <p className="text-sm text-dark-600 mb-3">{car.city}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {car.fuelType && (
                          <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                            {car.fuelType}
                          </span>
                        )}
                        {car.transmission && (
                          <span className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded text-xs font-medium">
                            {car.transmission}
                          </span>
                        )}
                        {car.mileage && (
                          <span className="px-2 py-1 bg-accent-50 text-accent-700 rounded text-xs font-medium">
                            {car.mileage} km
                          </span>
                        )}
                        {typeof car.ownersCount === "number" && (
                          <span className="px-2 py-1 bg-dark-100 text-dark-700 rounded text-xs font-medium">
                            {car.ownersCount}{" "}
                            {car.ownersCount === 1 ? "owner" : "owners"}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (car.status === "SOLD") {
                              showInfo(
                                "This car has been sold and cannot be edited."
                              );
                              return;
                            }
                            setEditingCar(car);
                          }}
                          disabled={car.status === "SOLD"}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                            car.status === "SOLD"
                              ? "bg-dark-300 text-dark-600 cursor-not-allowed opacity-50"
                              : "bg-primary-600 hover:bg-primary-700 text-white"
                          }`}
                          title={
                            car.status === "SOLD"
                              ? "Cannot edit sold cars"
                              : "Edit car listing"
                          }
                        >
                          <Edit className="w-4 h-4" />
                          {car.status === "SOLD" ? "Sold" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(car)}
                          disabled={car.status === "SOLD"}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                            car.status === "SOLD"
                              ? "bg-dark-300 text-dark-600 cursor-not-allowed opacity-50"
                              : "bg-error-600 hover:bg-error-700 text-white"
                          }`}
                          title={
                            car.status === "SOLD"
                              ? "Cannot delete sold cars"
                              : "Delete car listing"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Section */}
            <div className="glass rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">
                Seller Tips
              </h3>
              <div className="space-y-2 text-dark-700 text-sm">
                <p>
                  ✅ Add clear, high-quality images of your car to attract more
                  buyers
                </p>
                <p>
                  ✅ Include detailed descriptions highlighting key features and
                  condition
                </p>
                <p>✅ Set competitive prices based on market research</p>
                <p>
                  ✅ Keep your listings updated and respond to buyer inquiries
                  promptly
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddSellerCarModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => setIsAddModalOpen(false)}
        />
      )}

      {editingCar && (
        <EditSellerCarModal
          isOpen={!!editingCar}
          onClose={() => setEditingCar(null)}
          car={editingCar}
          onSuccess={() => setEditingCar(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
