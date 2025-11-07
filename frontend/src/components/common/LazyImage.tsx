import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Car as CarIcon } from 'lucide-react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string; // Backwards compatibility: applied to both container and image
  containerClassName?: string;
  imageClassName?: string;
  sizes?: string; // For responsive images (e.g., "(max-width: 768px) 100vw, 50vw")
  srcSet?: string; // For responsive images
}

// Helper function to generate WebP/AVIF URLs for Cloudinary images
const getOptimizedImageUrl = (originalUrl: string, format?: 'webp' | 'avif'): string => {
  if (!originalUrl) return originalUrl;
  
  // If it's a Cloudinary URL, add format parameter
  if (originalUrl.includes('cloudinary.com') || originalUrl.includes('res.cloudinary.com')) {
    const separator = originalUrl.includes('?') ? '&' : '?';
    if (format) {
      return `${originalUrl}${separator}f_${format},q_auto`;
    }
    return `${originalUrl}${separator}q_auto`;
  }
  
  // For other URLs, try to convert extension (basic implementation)
  if (format && (originalUrl.endsWith('.jpg') || originalUrl.endsWith('.jpeg') || originalUrl.endsWith('.png'))) {
    return originalUrl.replace(/\.(jpg|jpeg|png)$/i, `.${format}`);
  }
  
  return originalUrl;
};

const LazyImage = ({ 
  src, 
  alt, 
  fallback,
  className = '',
  containerClassName = '',
  imageClassName,
  sizes,
  srcSet,
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  // Generate optimized image URLs
  const avifSrc = getOptimizedImageUrl(src, 'avif');
  const webpSrc = getOptimizedImageUrl(src, 'webp');
  const originalSrc = getOptimizedImageUrl(src);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  const defaultFallback = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900">
      <div className="text-center">
        <CarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-dark-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400 dark:text-dark-500">
          No Image Available
        </p>
      </div>
    </div>
  );

  if (hasError) {
    return <>{fallback || defaultFallback}</>;
  }

  const wrapperClasses = ['relative', className, containerClassName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const imgClasses = [imageClassName ?? className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div ref={imgRef} className={wrapperClasses}>
      {!isInView ? (
        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-800 dark:to-dark-900 animate-pulse" />
      ) : (
        <>
          {!isLoaded && (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-800 dark:to-dark-900 animate-pulse absolute inset-0" />
          )}
          <picture className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 relative z-10 block`}>
            {/* AVIF format (best compression) */}
            <source srcSet={avifSrc} type="image/avif" />
            {/* WebP format (good compression, wider support) */}
            <source srcSet={webpSrc} type="image/webp" />
            {/* Fallback to original format */}
            <img
              src={originalSrc}
              alt={alt}
              className={imgClasses}
              loading="lazy"
              decoding="async"
              sizes={sizes}
              srcSet={srcSet}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              {...props}
            />
          </picture>
        </>
      )}
    </div>
  );
};

export default LazyImage;

