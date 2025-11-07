import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { uploadImages } from "../../services/uploadService";
import { useToast } from "../common/ToastContainer";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  required?: boolean;
}

const MultiImageUpload = ({
  value = [],
  onChange,
  label = "Car Images",
  maxImages = 10,
  required = false,
}: MultiImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = Array.isArray(value) ? value : [];
  const { showWarning, showError } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total image count
    if (images.length + files.length > maxImages) {
      showWarning(
        `Maximum ${maxImages} images allowed. You can add ${
          maxImages - images.length
        } more.`
      );
      return;
    }

    // Validate files
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      showWarning(
        "Some files are invalid. Only image files under 5MB are allowed."
      );
      return;
    }

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      const result = await uploadImages(files);
      const newUrls = result.images.map((img) => img.url);
      onChange([...images, ...newUrls]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      showError("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    if (images.length === 0) return;
    const newImages = [images[index], ...images.filter((_, i) => i !== index)];
    onChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-dark-900 mb-2">
        {label} {required && <span className="text-error-600">*</span>}
        <span className="text-xs font-normal text-dark-500 ml-2">
          ({images.length}/{maxImages} images)
        </span>
      </label>

      <div className="space-y-4">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg border-2 border-dark-200 overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                  <div className="absolute top-2 left-2">
                    {index === 0 && (
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded hover:bg-primary-700 transition"
                        title="Set as primary"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="px-3 py-1.5 bg-error-600 text-white text-xs font-semibold rounded hover:bg-error-700 transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < maxImages && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-dark-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <span className="text-dark-700 font-medium">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-primary-600" />
                  <span className="text-dark-700 font-medium">
                    Upload Images ({images.length}/{maxImages})
                  </span>
                </>
              )}
            </button>
            <p className="text-xs text-dark-500 mt-1">
              Max file size: 5MB each • Supported: JPG, PNG, WebP • First image
              is primary
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
