import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
} from "../services/authApi";
import { updateUser } from "../store/slices/authSlice";
import Navbar from "../components/layout/Navbar";
import { User, Camera, Save, X } from "lucide-react";
import { useToast } from "../components/common/ToastContainer";
import { getApiErrorMessage } from "../utils/error";

const Profile = () => {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { data, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const { showSuccess, showError, showWarning } = useToast();

  const user = data?.user || authUser;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    country: user?.country || "India",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        country: user.country || "India",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile(formData).unwrap();
      dispatch(updateUser(result.user));
      setIsEditing(false);
      refetch();
      showSuccess("Profile updated successfully!");
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to update profile");
      showError(message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showWarning("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const result = await uploadImage(formData).unwrap();
      dispatch(updateUser(result.user));
      refetch();
      showSuccess("Profile image updated successfully!");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to upload profile image"
      );
      showError(message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-dark-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-2">
            My Profile
          </h1>
          <p className="text-dark-600">
            Manage your profile information and settings
          </p>
        </div>

        <div className="glass rounded-xl p-6 md:p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-dark-200">
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                  <User className="w-16 h-16 text-primary-600" />
                </div>
              )}
              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark-900 mb-2">
                {user.name}
              </h2>
              <p className="text-dark-600 mb-1">{user.email}</p>
              <p className="text-sm text-dark-500 capitalize">
                {user.role.toLowerCase()}
              </p>
              {user.isAadhaarVerified && (
                <span className="inline-block mt-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
                  ✓ Aadhaar Verified
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  setFormData({
                    name: user.name || "",
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.city || "",
                    state: user.state || "",
                    pincode: user.pincode || "",
                    country: user.country || "India",
                    bio: user.bio || "",
                  });
                }
                setIsEditing(!isEditing);
              }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, apartment, suite, etc."
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Bio / Description
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border-2 border-dark-200 rounded-lg focus:border-primary-600 focus:outline-none disabled:bg-dark-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      phone: user.phone || "",
                      address: user.address || "",
                      city: user.city || "",
                      state: user.state || "",
                      pincode: user.pincode || "",
                      country: user.country || "India",
                      bio: user.bio || "",
                    });
                    setIsEditing(false);
                  }}
                  className="w-full sm:w-auto px-6 py-2 border-2 border-dark-300 text-dark-700 rounded-lg font-semibold hover:bg-dark-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
