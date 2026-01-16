import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

/**
 * OptimizedImage Component
 * 
 * Lazy loads images with blur effect during loading and fallback on error.
 * Only loads images when they are within 100px of the viewport.
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  placeholder,
  onError,
  fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      if (onError) {
        onError(e);
      }
    }
  };

  // Default placeholder with pulse animation
  const defaultPlaceholder = (
    <div className={`bg-gray-200 animate-pulse ${className}`} style={{ minHeight: '100px' }} />
  );

  return (
    <LazyLoadImage
      src={imageSrc}
      alt={alt}
      className={className}
      effect="blur"
      threshold={100}
      placeholder={placeholder || defaultPlaceholder}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
