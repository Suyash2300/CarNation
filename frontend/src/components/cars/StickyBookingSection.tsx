import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import type { Car } from '../../services/carApi';

interface StickyBookingSectionProps {
  car: Car;
  isAuthenticated: boolean;
  onContactSeller: () => void;
  isCreatingConversation: boolean;
}

const StickyBookingSection = ({
  car,
  isAuthenticated,
  onContactSeller,
  isCreatingConversation,
}: StickyBookingSectionProps) => {
  const navigate = useNavigate();

  const price = car.isForRent ? car.rentalPrice : car.salePrice;
  const priceUnit = car.isForRent ? 'per day' : '';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-dark-200 shadow-2xl z-40 p-4 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
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

        <div className="flex gap-2">
          {car.isForRent && (
            <Button
              onClick={() => navigate(`/rental-booking/${car.id}`)}
              variant="primary"
              size="md"
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Now
            </Button>
          )}
          {car.isForSale && (
            <>
              <Button
                onClick={() => navigate(`/purchase-booking/${car.id}`)}
                variant="primary"
                size="md"
                className="whitespace-nowrap"
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
              >
                <MessageCircle className="w-4 h-4 mr-1" />
              </Button>
            </>
          )}
          {car.isForRent && car.owner && (
            <Button
              onClick={onContactSeller}
              disabled={isCreatingConversation}
              variant="outline"
              size="md"
              isLoading={isCreatingConversation}
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

