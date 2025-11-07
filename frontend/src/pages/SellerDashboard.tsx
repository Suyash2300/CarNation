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
import { useGetDealsQuery } from "../services/dealsApi";

const SellerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<
    "listings" | "subscription" | "deals"
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
  const [deleteCar] = useDeleteSellerCarMutation();

  const cars = data?.cars || [];
  const stats = statsData?.stats;
  const deals = dealsData?.deals || [];
  const { showSuccess, showError, showInfo } = useToast();
  const confirm = useConfirm();

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
                {deals.map((deal) => (
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
                    </div>
                  </div>
                ))}
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
                className="w-full sm:w-auto bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
