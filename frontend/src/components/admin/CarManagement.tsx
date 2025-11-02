import { useState } from 'react';
import { useGetAdminCarsQuery, useDeleteCarMutation, type Car } from '../../services/carApi';
import { Plus, Edit, Trash2, Car as CarIcon } from 'lucide-react';
import AddCarModal from './AddCarModal';
import EditCarModal from './EditCarModal';

const CarManagement = () => {
  const { data, isLoading } = useGetAdminCarsQuery();
  const [deleteCar] = useDeleteCarMutation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const cars = data?.cars || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(id).unwrap();
      } catch (error) {
        console.error('Failed to delete car:', error);
      }
    }
  };

  const handleCarAdded = () => {
    setShowAddModal(false);
  };

  const handleCarUpdated = () => {
    setEditingCar(null);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading cars...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-dark-900">Car Management</h2>
          <p className="text-dark-600 mt-1">Manage your rental fleet</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New Car
        </button>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-12">
          <CarIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <p className="text-dark-600 mb-4">No cars added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add Your First Car
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
              {car.primaryImage && (
                <img
                  src={car.primaryImage}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h3 className="text-xl font-bold text-dark-900 mb-1">
                  {car.brand} {car.model}
                </h3>
                <p className="text-dark-600 text-sm mb-3">{car.year} • {car.fuelType}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{car.rentalPrice}/day
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    car.status === 'AVAILABLE' ? 'bg-success-100 text-success-700' :
                    car.status === 'RENTED' ? 'bg-error-100 text-error-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
                    {car.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCar(car)}
                    className="flex-1 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-200 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="flex-1 bg-error-100 text-error-700 px-4 py-2 rounded-lg font-semibold hover:bg-error-200 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddCarModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleCarAdded}
        />
      )}

      {editingCar && (
        <EditCarModal
          isOpen={!!editingCar}
          onClose={() => setEditingCar(null)}
          car={editingCar}
          onSuccess={handleCarUpdated}
        />
      )}
    </div>
  );
};

export default CarManagement;

