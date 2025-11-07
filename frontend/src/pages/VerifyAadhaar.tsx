import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import { Shield, Upload, CheckCircle, AlertCircle } from "lucide-react";

const VerifyAadhaar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "front") {
        setFrontImage(file);
      } else {
        setBackImage(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    if (!frontImage || !backImage) {
      setError("Please upload both front and back images of your Aadhaar card");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("aadhaarNumber", aadhaarNumber);
      formData.append("aadhaarFrontImage", frontImage);
      formData.append("aadhaarBackImage", backImage);

      const token = localStorage.getItem("token");
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      const response = await fetch(`${API_URL}/auth/upload-aadhaar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload Aadhaar documents");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload Aadhaar documents"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.isAadhaarVerified) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-xl p-6 sm:p-8 text-center">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-dark-900 mb-2">
              Aadhaar Already Verified
            </h1>
            <p className="text-dark-600 mb-6">
              Your Aadhaar has already been verified. You can now rent cars!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Verify Your Aadhaar
          </h1>
          <p className="text-dark-600">
            Upload your Aadhaar card documents for verification. This is
            required to rent cars.
          </p>
        </div>

        <div className="glass rounded-xl p-6 sm:p-8">
          {success && (
            <div className="mb-6 p-4 bg-success-100 border border-success-300 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <p className="text-success-700">
                Aadhaar documents uploaded successfully! Admin will verify them
                shortly.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-error-100 border border-error-300 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error-600" />
              <p className="text-error-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Aadhaar Number */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) =>
                  setAadhaarNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 12)
                  )
                }
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Front Image */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Aadhaar Front Image
              </label>
              <div className="border-2 border-dashed border-dark-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "front")}
                  className="hidden"
                  id="front-image"
                  required
                />
                <label
                  htmlFor="front-image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-dark-400" />
                  {frontImage ? (
                    <div className="mt-2">
                      <p className="text-sm text-dark-600">{frontImage.name}</p>
                      <img
                        src={URL.createObjectURL(frontImage)}
                        alt="Aadhaar Front"
                        className="mt-2 max-w-full max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-dark-600">
                      Click to upload front side of Aadhaar card
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Back Image */}
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Aadhaar Back Image
              </label>
              <div className="border-2 border-dashed border-dark-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "back")}
                  className="hidden"
                  id="back-image"
                  required
                />
                <label
                  htmlFor="back-image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-dark-400" />
                  {backImage ? (
                    <div className="mt-2">
                      <p className="text-sm text-dark-600">{backImage.name}</p>
                      <img
                        src={URL.createObjectURL(backImage)}
                        alt="Aadhaar Back"
                        className="mt-2 max-w-full max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-dark-600">
                      Click to upload back side of Aadhaar card
                    </p>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Submit for Verification"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-info-100 border border-info-300 rounded-lg">
            <p className="text-sm text-info-700">
              <strong>Note:</strong> Your documents will be reviewed by an
              admin. You'll be notified once verification is complete. This
              process usually takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAadhaar;
