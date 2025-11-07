import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import type { Car } from '../../services/carApi';

interface StickyBookingSectionProps {
  car: Car;
  isAuthenticated?: boolean;
  onContactSeller: () => void;
  isCreatingConversation: boolean;
}

const StickyBookingSection = ({
  car,
  onContactSeller,
  isCreatingConversation,
}: StickyBookingSectionProps) => {
  const navigate = useNavigate();

  const price = car.isForRent ? car.rentalPrice : car.salePrice;
  const priceUnit = car.isForRent ? 'per day' : '';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-dark-200 shadow-2xl z-40 p-4 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-600">
              ₹{price?.toLocaleString()}
            </span>
            {priceUnit && (
              <span className="text-sm text-dark-600">/{priceUnit}</span>
            )}
          </div>
          <p className="text-xs text-dark-600 truncate">
            {car.brand} {car.model}
          </p>
        </div>

        <div className="flex w-full sm:w-auto flex-wrap sm:flex-nowrap gap-2">
          {car.isForRent && (
            <Button
              onClick={() => navigate(`/rental-booking/${car.id}`)}
              variant="primary"
              size="md"
              className="flex-1 sm:flex-none whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Now
            </Button>
          )}
          {(car as any).isForSale && (
            <>
              <Button
                onClick={() => navigate(`/purchase-booking/${car.id}`)}
                variant="primary"
                size="md"
                className="flex-1 sm:flex-none whitespace-nowrap"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Buy Now
              </Button>
              <Button
                onClick={onContactSeller}
                disabled={isCreatingConversation}
                variant="outline"
                size="md"
                isLoading={isCreatingConversation}
                className="flex-1 sm:flex-none"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
              </Button>
            </>
          )}
          {car.isForRent && (car as any).owner && (
            <Button
              onClick={onContactSeller}
              disabled={isCreatingConversation}
              variant="outline"
              size="md"
              isLoading={isCreatingConversation}
              className="flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyBookingSection;

