import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../services/uploadService';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

const ImageUpload = ({ value, onChange, label = 'Image', required = false }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      const result = await uploadImage(file);
      onChange(result.url);
      setPreview(result.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-dark-900 mb-2">
        {label} {required && <span className="text-error-600">*</span>}
      </label>

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative w-full h-48 rounded-lg border-2 border-dark-200 overflow-hidden group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-error-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
                <span className="text-dark-700 font-medium">Uploading...</span>
              </>
            ) : preview ? (
              <>
                <ImageIcon className="w-5 h-5 text-primary-600" />
                <span className="text-dark-700 font-medium">Change Image</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-primary-600" />
                <span className="text-dark-700 font-medium">Upload Image</span>
              </>
            )}
          </button>
          <p className="text-xs text-dark-500 mt-1">
            Max file size: 5MB • Supported formats: JPG, PNG, WebP
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;

