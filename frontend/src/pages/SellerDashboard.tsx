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
} from "lucide-react";
import AddSellerCarModal from "../components/seller/AddSellerCarModal";
import EditSellerCarModal from "../components/seller/EditSellerCarModal";

const SellerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetSellerCarsQuery();
  const { data: statsData } = useGetSellerStatsQuery();
  const [deleteCar] = useDeleteSellerCarMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const cars = data?.cars || [];
  const stats = statsData?.stats;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this car listing?")) {
      try {
        await deleteCar(id).unwrap();
      } catch (error) {
        console.error("Failed to delete car:", error);
        alert("Failed to delete car. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-600 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-dark-900">
                    {stats.totalCars}
                  </p>
                </div>
                <CarIcon className="w-10 h-10 text-primary-600" />
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-success-600">
                    {stats.availableCars}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-success-600" />
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-600 mb-1">Sold</p>
                  <p className="text-3xl font-bold text-dark-600">
                    {stats.soldCars}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-dark-600" />
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-600 mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-primary-600">
                    ₹{stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary-600" />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-900">
              My Car Listings
            </h2>
            <p className="text-dark-600">
              Manage your pre-owned vehicles for sale
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCar(car)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="flex items-center justify-center gap-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg font-semibold transition"
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
      </div>

      {/* Modals */}
      <AddSellerCarModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setIsAddModalOpen(false)}
      />

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
