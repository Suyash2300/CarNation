import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

interface ImageZoomModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  alt: string;
}

const ImageZoomModal = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  alt,
}: ImageZoomModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-dark-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-primary-400 transition z-10 bg-dark-900/50 rounded-full p-2 hover:bg-dark-900/70"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-7xl w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-dark-900/70 hover:bg-dark-900/90 text-white p-3 rounded-full transition backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-dark-900/70 hover:bg-dark-900/90 text-white p-3 rounded-full transition backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark-900/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageZoomModal;

