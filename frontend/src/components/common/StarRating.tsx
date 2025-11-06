import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
}

const StarRating = ({ rating, maxRating = 5, size = 'md', showRating = true }: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFull = starValue <= Math.floor(rating);
    const isHalf = !isFull && starValue - 0.5 <= rating;

    return (
      <Star
        key={index}
        className={`${sizeClasses[size]} ${
          isFull || isHalf
            ? 'text-warning-500 fill-warning-500'
            : 'text-dark-300 fill-none'
        }`}
        style={
          isHalf
            ? {
                clipPath: 'inset(0 50% 0 0)',
              }
            : undefined
        }
      />
    );
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showRating && (
        <span className="text-sm font-semibold text-dark-900 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;








