import { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import {
  useCreateCarMutation,
  type CreateCarRequest,
} from "../../services/carApi";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCarModal = ({ isOpen, onClose, onSuccess }: AddCarModalProps) => {
  const [createCar, { isLoading }] = useCreateCarMutation();
  const [formData, setFormData] = useState<CreateCarRequest>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    mileage: undefined,
    ownersCount: undefined,
    transmission: "",
    fuelType: "",
    seats: undefined,
    rentalPrice: 0,
    description: "",
    images: [],
    primaryImage: "",
    city: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" ||
        name === "mileage" ||
        name === "ownersCount" ||
        name === "seats" ||
        name === "rentalPrice"
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const transmissionOptions = [
    { value: "", label: "Select" },
    { value: "Automatic", label: "Automatic" },
    { value: "Manual", label: "Manual" },
  ];

  const fuelTypeOptions = [
    { value: "", label: "Select" },
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" },
  ];

  const handleSelectChange = (
    name: string,
    selected: { value: string } | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selected ? selected.value : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCar(formData).unwrap();
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        mileage: undefined,
        ownersCount: undefined,
        transmission: "",
        fuelType: "",
        seats: undefined,
        rentalPrice: 0,
        description: "",
        images: [],
        primaryImage: "",
        city: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create car:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-dark-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-dark-900">Add New Car</h2>
            <button
              onClick={onClose}
              className="text-dark-500 hover:text-dark-900 transition"
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
                  placeholder="e.g., Toyota"
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
                  placeholder="e.g., Camry"
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
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              </div>

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
                  placeholder="e.g., Black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Rental Price/Day *
                </label>
                <input
                  type="number"
                  name="rentalPrice"
                  value={formData.rentalPrice || ""}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="₹0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                    handleSelectChange("transmission", selected)
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select transmission"
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
                    handleSelectChange("fuelType", selected)
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select fuel type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats || ""}
                  onChange={handleChange}
                  min="2"
                  max="10"
                  className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  KM Driven
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage || ""}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Number of Owners
                </label>
                <input
                  type="number"
                  name="ownersCount"
                  value={formData.ownersCount ?? ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                placeholder="e.g., Mumbai"
              />
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
                      newImages = [url, ...existingImages]; // Add at beginning
                    }
                    return {
                      ...prev,
                      primaryImage: url,
                      images:
                        newImages.length > 0 ? newImages : url ? [url] : [],
                    };
                  });
                }}
                label="Primary Car Image"
                required
              />
            </div>

            <div>
              <MultiImageUpload
                value={formData.images}
                onChange={(urls) => {
                  setFormData((prev) => ({
                    ...prev,
                    images: urls,
                    // Set first image as primary if no primary is set
                    primaryImage: prev.primaryImage || urls[0] || "",
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
                placeholder="Car description..."
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
                {isLoading ? "Adding..." : "Add Car"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCarModal;
