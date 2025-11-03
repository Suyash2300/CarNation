interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'image' | 'button' | 'avatar';
  className?: string;
  count?: number;
}

const SkeletonLoader = ({ variant = 'card', className = '', count = 1 }: SkeletonLoaderProps) => {
  const baseClasses = 'animate-pulse bg-dark-200 rounded';

  const variants = {
    card: 'h-96 w-full',
    text: 'h-4 w-full',
    image: 'h-64 w-full',
    button: 'h-10 w-24',
    avatar: 'h-12 w-12 rounded-full',
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`${baseClasses} ${variants[variant]} ${className}`} />
        ))}
      </>
    );
  }

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
};

export default SkeletonLoader;

