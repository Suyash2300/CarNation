const CarCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
      {/* Image Skeleton */}
      <div className="w-full h-72 bg-dark-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-dark-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-dark-200 rounded animate-pulse w-1/2" />
        </div>

        {/* Price */}
        <div className="h-8 bg-dark-200 rounded animate-pulse w-2/3" />

        {/* Features */}
        <div className="flex gap-2">
          <div className="h-7 bg-dark-200 rounded-full animate-pulse w-20" />
          <div className="h-7 bg-dark-200 rounded-full animate-pulse w-24" />
          <div className="h-7 bg-dark-200 rounded-full animate-pulse w-16" />
        </div>

        {/* Button */}
        <div className="h-11 bg-dark-200 rounded-xl animate-pulse w-full mt-4" />
      </div>
    </div>
  );
};

export default CarCardSkeleton;

