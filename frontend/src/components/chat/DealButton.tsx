import { useState } from 'react';
import { Conversation } from '../../services/chatApi';
import { useCreateDealMutation } from '../../services/dealsApi';
import { useAppSelector } from '../../hooks/redux';
import { Handshake } from 'lucide-react';
import { useToast } from '../common/ToastContainer';

interface DealButtonProps {
  conversation: Conversation;
  onDealCreated?: () => void;
}

const DealButton = ({ conversation, onDealCreated }: DealButtonProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [createDeal, { isLoading }] = useCreateDealMutation();
  const [showDealModal, setShowDealModal] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [dealType, setDealType] = useState<'PURCHASE' | 'RENTAL'>('PURCHASE');
  const { showWarning, showSuccess, showError } = useToast();

  if (!conversation.car) {
    return null; // No car associated with this conversation
  }

  const car = conversation.car;
  const otherParticipant = conversation.participant1Id === user?.id
    ? conversation.participant2
    : conversation.participant1;

  const handleCreateDeal = async () => {
    if (!agreedPrice || parseFloat(agreedPrice) <= 0) {
      showWarning('Please enter a valid agreed price');
      return;
    }

    try {
      await createDeal({
        conversationId: conversation.id,
        carId: car.id,
        agreedPrice: parseFloat(agreedPrice),
        dealType,
      }).unwrap();

      showSuccess('Deal created successfully!');
      setShowDealModal(false);
      setAgreedPrice('');
      onDealCreated?.();
    } catch (error: any) {
      showError(error?.data?.error || 'Failed to create deal');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDealModal(true)}
        className="flex items-center gap-2 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
      >
        <Handshake className="w-4 h-4" />
        Mark as Deal
      </button>

      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-dark-900 mb-4">
              Create Deal
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-600 mb-2">Car</p>
                <p className="font-semibold text-dark-900">
                  {car.brand} {car.model} ({car.year})
                </p>
              </div>

              <div>
                <p className="text-sm text-dark-600 mb-2">With</p>
                <p className="font-semibold text-dark-900">{otherParticipant.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Deal Type *
                </label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value as 'PURCHASE' | 'RENTAL')}
                  className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Agreed Price (₹) *
                </label>
                <input
                  type="number"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder={dealType === 'PURCHASE' 
                    ? car.salePrice?.toString() || 'Enter price'
                    : 'Enter rental amount'
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDealModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-dark-300 text-dark-700 font-semibold rounded-lg hover:bg-dark-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDeal}
                  disabled={isLoading || !agreedPrice}
                  className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DealButton;

