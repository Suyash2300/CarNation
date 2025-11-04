import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';
import { useUpdateSellerCarMutation, type Car } from '../../services/carApi';
import ImageUpload from '../admin/ImageUpload';
import MultiImageUpload from '../admin/MultiImageUpload';

interface EditSellerCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  onSuccess: () => void;
}

const EditSellerCarModal = ({
  isOpen,
  onClose,
  car,
  onSuccess,
}: EditSellerCarModalProps) => {
  const [updateCar, { isLoading }] = useUpdateSellerCarMutation();
  const [formData, setFormData] = useState({
    brand: car.brand,
    model: car.model,
    year: car.year,
    color: car.color || '',
    mileage: car.mileage || undefined,
    transmission: car.transmission || '',
    fuelType: car.fuelType || '',
    seats: car.seats || undefined,
    salePrice: car.salePrice || 0,
    description: car.description || '',
    primaryImage: car.primaryImage || '',
    images: car.images ? [...car.images] : [], // Create a new array copy
    city: car.city || '',
    status: car.status,
  });

  useEffect(() => {
    if (car) {
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        color: car.color || '',
        mileage: car.mileage || undefined,
        transmission: car.transmission || '',
        fuelType: car.fuelType || '',
        seats: car.seats || undefined,
        salePrice: car.salePrice || 0,
        description: car.description || '',
        primaryImage: car.primaryImage || '',
        images: car.images ? [...car.images] : [], // Create a new array copy
        city: car.city || '',
        status: car.status,
      });
    }
  }, [car]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'year' ||
        name === 'mileage' ||
        name === 'seats' ||
        name === 'salePrice'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const transmissionOptions = [
    { value: '', label: 'Select' },
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
  ];

  const fuelTypeOptions = [
    { value: '', label: 'Select' },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'PENDING', label: 'Pending' },
  ];

  const handleSelectChange = (name: string, selected: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selected ? selected.value : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCar({ id: car.id, data: formData }).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Failed to update car:', error);
      alert('Failed to update car listing. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-dark-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark-900">Edit Car Listing</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Sale Price (₹) *
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice || ''}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Status
              </label>
              <Select
                options={statusOptions}
                value={statusOptions.find(
                  (opt) => opt.value === formData.status
                )}
                onChange={(selected) => handleSelectChange('status', selected)}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Transmission
              </label>
              <Select
                options={transmissionOptions}
                value={transmissionOptions.find(
                  (opt) => opt.value === formData.transmission
                )}
                onChange={(selected) =>
                  handleSelectChange('transmission', selected)
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Fuel Type
              </label>
              <Select
                options={fuelTypeOptions}
                value={fuelTypeOptions.find(
                  (opt) => opt.value === formData.fuelType
                )}
                onChange={(selected) =>
                  handleSelectChange('fuelType', selected)
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Mileage (km)
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Seats
              </label>
              <input
                type="number"
                name="seats"
                value={formData.seats || ''}
                onChange={handleChange}
                min="2"
                max="10"
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>

          <div>
            <ImageUpload
              value={formData.primaryImage}
              onChange={(url) => {
                setFormData((prev) => {
                  // Create a new array copy to avoid mutating frozen arrays
                  const existingImages = prev.images ? [...prev.images] : [];
                  let newImages = existingImages;
                  if (url && !existingImages.includes(url)) {
                    newImages = [url, ...existingImages];
                  }
                  return {
                    ...prev,
                    primaryImage: url,
                    images: newImages.length > 0 ? newImages : url ? [url] : [],
                  };
                });
              }}
              label="Primary Car Image"
            />
          </div>

          <div>
            <MultiImageUpload
              value={formData.images}
              onChange={(urls) => {
                setFormData((prev) => ({
                  ...prev,
                  images: urls,
                  primaryImage: prev.primaryImage || urls[0] || '',
                }));
              }}
              label="Additional Images"
              maxImages={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-dark-300 text-dark-700 font-semibold hover:bg-dark-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSellerCarModal;

