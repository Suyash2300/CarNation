import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetCarByIdQuery } from '../services/carApi';
import { useCreateConversationMutation } from '../services/chatApi';
import { useAppSelector } from '../hooks/redux';
import Navbar from '../components/layout/Navbar';
import AvailabilityBadge from '../components/rental/AvailabilityBadge';
import ImageZoomModal from '../components/cars/ImageZoomModal';
import StickyBookingSection from '../components/cars/StickyBookingSection';
import { useToast } from '../components/common/ToastContainer';
import Breadcrumbs from '../components/common/Breadcrumbs';
import {
  MapPin,
  Calendar,
  Fuel,
  Settings,
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  DollarSign,
} from 'lucide-react';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCarByIdQuery(id!);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [createConversation, { isLoading: isCreatingConversation }] = useCreateConversationMutation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showStickyBooking, setShowStickyBooking] = useState(false);
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const { showError, showSuccess } = useToast();

  const car = data?.car;
  const allImages = car?.images && car.images.length > 0 ? car.images : (car?.primaryImage ? [car.primaryImage] : []);

  // Handle sticky booking section visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!bookingSectionRef.current) return;
      
      const rect = bookingSectionRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowStickyBooking(!isVisible && window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [car]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-dark-600">Loading car details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-light-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-xl text-dark-600 mb-4">Car not found</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }

    if (!car) return;

    const otherUserId = car.isForSale ? car.seller?.id : car.owner?.id;
    if (!otherUserId) {
      showError('Seller/Owner information not available');
      return;
    }

    try {
      const result = await createConversation({
        otherUserId,
        carId: car.id,
      }).unwrap();

      showSuccess('Conversation started!');
      // Navigate to chat with the conversation open
      navigate('/chat', { state: { conversationId: result.conversation.id } });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      showError(error?.data?.error || 'Failed to start conversation');
    }
  };

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            {
              label: car.isForRent ? 'Rent' : 'Buy',
              path: car.isForRent ? '/rent' : '/used-cars',
            },
            {
              label: `${car.brand} ${car.model}`,
            },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-100 group cursor-pointer">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${car.brand} ${car.model} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setIsZoomOpen(true)}
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? 'border-primary-600 ring-2 ring-primary-600/50'
                        : 'border-dark-200 hover:border-dark-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1 className="text-4xl font-bold text-dark-900 mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-xl text-dark-600 mb-4">{car.year}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  ₹{car.isForRent ? car.rentalPrice : car.salePrice?.toLocaleString()}
                </span>
                {car.isForRent && (
                  <span className="text-dark-600">per day</span>
                )}
              </div>
              {car.city && (
                <div className="flex items-center gap-1 text-dark-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{car.city}</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  car.status === 'AVAILABLE'
                    ? 'bg-success-100 text-success-700'
                    : car.status === 'SOLD'
                    ? 'bg-dark-100 text-dark-700'
                    : 'bg-warning-100 text-warning-700'
                }`}
              >
                {car.status}
              </span>
              
              {/* Availability Status for Rental Cars */}
              {car.isForRent && car.availability && (
                <AvailabilityBadge availability={car.availability} />
              )}
              
              {car.isForRent && car.availability?.nextAvailableDate && (
                <p className="text-sm text-warning-700 font-semibold">
                  Available after {new Date(car.availability.nextAvailableDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              
              {/* Booked Dates */}
              {car.isForRent && car.availability && car.availability.bookedDates.length > 0 && (
                <div className="w-full mt-3">
                  <p className="text-sm font-semibold text-dark-900 mb-2">Booked Dates:</p>
                  <div className="space-y-2">
                    {car.availability.bookedDates.map((booking, idx) => (
                      <div key={idx} className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1.5 bg-dark-100 rounded-lg text-sm text-dark-700">
                          {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          booking.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' : 'bg-warning-100 text-warning-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Availability Info for Rentals */}
            {car.isForRent && car.availability && (
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-dark-900 mb-2">Availability</h3>
                {car.availability.nextAvailableDate && (
                  <p className="text-sm text-dark-600 mb-2">
                    Next available: <span className="font-semibold text-primary-600">
                      {new Date(car.availability.nextAvailableDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {car.availability.bookedDates.length > 0 && (
                  <div>
                    <p className="text-xs text-dark-500 mb-2">Booked periods:</p>
                    <div className="space-y-1">
                      {car.availability.bookedDates.map((period, idx) => (
                        <p key={idx} className="text-xs text-dark-600">
                          {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Car Specifications */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-dark-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {car.fuelType && (
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-dark-600">Fuel Type</p>
                      <p className="font-semibold text-dark-900">{car.fuelType}</p>
                    </div>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-dark-600">Transmission</p>
                      <p className="font-semibold text-dark-900">{car.transmission}</p>
                    </div>
                  </div>
                )}
                {car.seats && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-dark-600">Seats</p>
                      <p className="font-semibold text-dark-900">{car.seats}</p>
                    </div>
                  </div>
                )}
                {car.mileage && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-dark-600">Mileage</p>
                      <p className="font-semibold text-dark-900">{car.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                )}
                {car.color && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-dark-300 bg-dark-100"></div>
                    <div>
                      <p className="text-sm text-dark-600">Color</p>
                      <p className="font-semibold text-dark-900">{car.color}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-dark-600">Year</p>
                    <p className="font-semibold text-dark-900">{car.year}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-dark-900 mb-4">Description</h2>
                <p className="text-dark-700 leading-relaxed whitespace-pre-wrap">
                  {car.description}
                </p>
              </div>
            )}

            {/* Seller Information (for used cars) */}
            {car.isForSale && car.seller && (
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-dark-900 mb-4">Seller Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-dark-600 mb-1">Name</p>
                    <p className="font-semibold text-dark-900">{car.seller.name}</p>
                  </div>
                  {car.seller.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-dark-600" />
                      <a
                        href={`mailto:${car.seller.email}`}
                        className="text-primary-600 hover:text-primary-700 transition"
                      >
                        {car.seller.email}
                      </a>
                    </div>
                  )}
                  {car.seller.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-dark-600" />
                      <a
                        href={`tel:${car.seller.phone}`}
                        className="text-primary-600 hover:text-primary-700 transition"
                      >
                        {car.seller.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4" ref={bookingSectionRef}>
              {car.isForRent && (
                <button
                  onClick={() => navigate(`/rental-booking/${car.id}`)}
                  className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button>
              )}
              {car.isForSale && (
                <>
                  <button
                    onClick={() => navigate(`/purchase-booking/${car.id}`)}
                    className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleContactSeller}
                    disabled={isCreatingConversation}
                    className="px-6 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingConversation ? 'Starting Chat...' : 'Contact Seller'}
                  </button>
                </>
              )}
              {car.isForRent && car.owner && (
                <button
                  onClick={handleContactSeller}
                  disabled={isCreatingConversation}
                  className="px-6 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Chat with Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <ImageZoomModal
          images={allImages}
          currentIndex={currentImageIndex}
          onClose={() => setIsZoomOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
          alt={`${car.brand} ${car.model} - Image ${currentImageIndex + 1}`}
        />
      )}

      {/* Sticky Booking Section (Mobile) */}
      {showStickyBooking && car && (
        <StickyBookingSection
          car={car}
          isAuthenticated={isAuthenticated}
          onContactSeller={handleContactSeller}
          isCreatingConversation={isCreatingConversation}
        />
      )}

      {/* Bottom padding for sticky booking section */}
      {showStickyBooking && <div className="h-20 lg:hidden" />}
    </div>
  );
};

export default CarDetail;

