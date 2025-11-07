import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCarByIdQuery } from "../services/carApi";
import { useCreateConversationMutation } from "../services/chatApi";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import AvailabilityBadge from "../components/rental/AvailabilityBadge";
import ImageZoomModal from "../components/cars/ImageZoomModal";
import StickyBookingSection from "../components/cars/StickyBookingSection";
import { useToast } from "../components/common/ToastContainer";
import Breadcrumbs from "../components/common/Breadcrumbs";
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
  MessageCircle,
  ShoppingCart,
  Car,
  Gauge,
  Palette,
} from "lucide-react";

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCarByIdQuery(id!);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [createConversation, { isLoading: isCreatingConversation }] =
    useCreateConversationMutation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showStickyBooking, setShowStickyBooking] = useState(false);
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const { showError, showSuccess } = useToast();

  const car = data?.car;

  // Memoize computed values to prevent unnecessary recalculations
  const isForSale = useMemo(
    () => Boolean((car as unknown as { isForSale?: boolean })?.isForSale),
    [car]
  );

  const ownerUser = useMemo(
    () => (car as unknown as { owner?: { id?: string } })?.owner,
    [car]
  );

  const allImages = useMemo(
    () =>
      car?.images && car.images.length > 0
        ? car.images
        : car?.primaryImage
        ? [car.primaryImage]
        : [],
    [car?.images, car?.primaryImage]
  );

  // Handle sticky booking section visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!bookingSectionRef.current) return;

      const rect = bookingSectionRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowStickyBooking(!isVisible && window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [car]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-6 text-lg font-semibold text-slate-600 dark:text-dark-300">
              Loading car details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-6">
              <Car className="w-20 h-20 mx-auto text-slate-300 dark:text-dark-600" />
            </div>
            <p className="text-2xl font-bold text-slate-700 dark:text-dark-200 mb-6">
              Car not found
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
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
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated || !user) {
      navigate("/auth");
      return;
    }

    if (!car) return;

    const otherUserId = isForSale ? car.seller?.id : ownerUser?.id;
    if (!otherUserId) {
      showError("Seller/Owner information not available");
      return;
    }

    try {
      const result = await createConversation({
        otherUserId,
        carId: car.id,
      }).unwrap();

      showSuccess("Conversation started!");
      // Navigate to chat with the conversation open
      navigate("/chat", { state: { conversationId: result.conversation.id } });
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      console.error("Error creating conversation:", e);
      showError(e?.data?.error || "Failed to start conversation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              {
                label: car.isForRent ? "Rent" : "Buy",
                path: car.isForRent ? "/rent" : "/used-cars",
              },
              {
                label: `${car.brand} ${car.model}`,
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900 shadow-xl group cursor-pointer">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${car.brand} ${car.model} - Image ${
                      currentImageIndex + 1
                    }`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onClick={() => setIsZoomOpen(true)}
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-dark-800/95 hover:bg-white dark:hover:bg-dark-800 text-dark-900 dark:text-white p-3 rounded-full transition shadow-lg backdrop-blur-sm"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-dark-800/95 hover:bg-white dark:hover:bg-dark-800 text-dark-900 dark:text-white p-3 rounded-full transition shadow-lg backdrop-blur-sm"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Car className="w-20 h-20 text-slate-300 dark:text-dark-600 mx-auto mb-3" />
                    <p className="text-slate-400 dark:text-dark-500">
                      No image available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`aspect-video rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                      index === currentImageIndex
                        ? "border-primary-600 ring-4 ring-primary-600/30 scale-105"
                        : "border-slate-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-500 hover:scale-105"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons - directly under images */}
            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              ref={bookingSectionRef}
            >
              {car.isForRent && (
                <button
                  onClick={() => navigate(`/rental-booking/${car.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Book Now
                </button>
              )}
              {isForSale && (
                <>
                  <button
                    onClick={() => navigate(`/purchase-booking/${car.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                  </button>
                  <button
                    onClick={handleContactSeller}
                    disabled={isCreatingConversation}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-3 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-500 font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isCreatingConversation ? "Starting..." : "Contact"}
                  </button>
                </>
              )}
              {car.isForRent && ownerUser && (
                <button
                  onClick={handleContactSeller}
                  disabled={isCreatingConversation}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-3 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-500 font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with Admin
                </button>
              )}
            </div>

            {/* Description - Below buttons on left side */}
            {car.description && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-dark-700">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-primary-600" />
                  Description
                </h2>
                <p className="text-slate-700 dark:text-dark-300 leading-relaxed whitespace-pre-wrap">
                  {car.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Title & Price Card */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-dark-700">
              <h1 className="text-3xl sm:text-4xl font-black text-dark-900 dark:text-white mb-3 leading-tight">
                {car.brand} {car.model}
              </h1>
              <p className="text-lg font-semibold text-slate-600 dark:text-dark-300 mb-4">
                {car.year}
              </p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-5xl font-black text-primary-600 dark:text-primary-500">
                  ₹
                  {car.isForRent
                    ? car.rentalPrice?.toLocaleString()
                    : car.salePrice?.toLocaleString()}
                </span>
                {car.isForRent && (
                  <span className="text-lg font-bold text-slate-600 dark:text-dark-400">
                    per day
                  </span>
                )}
              </div>

              {car.city && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-dark-300 bg-slate-100 dark:bg-dark-700 px-4 py-2.5 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="font-semibold">{car.city}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold shadow-md ${
                  car.status === "AVAILABLE"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800"
                    : car.status === "SOLD"
                    ? "bg-slate-100 text-slate-700 dark:bg-dark-700 dark:text-dark-300 border-2 border-slate-200 dark:border-dark-600"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800"
                }`}
              >
                {car.status}
              </span>

              {/* Availability Status for Rental Cars */}
              {car.isForRent && car.availability && (
                <AvailabilityBadge availability={car.availability} />
              )}
            </div>

            {/* Next Available Date - Only show if date is in the future */}
            {car.isForRent &&
              car.availability?.nextAvailableDate &&
              (() => {
                const nextDate = new Date(car.availability.nextAvailableDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to compare dates only
                nextDate.setHours(0, 0, 0, 0);

                // Only show if the date is in the future (not today or past)
                if (nextDate > today) {
                  return (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Available from{" "}
                        {nextDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  );
                }
                // If date is today or past, don't show the message (car is available now)
                return null;
              })()}

            {/* Booked Dates */}
            {car.isForRent &&
              car.availability &&
              car.availability.bookedDates.length > 0 && (
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-dark-700">
                  <p className="text-lg font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Booked Dates
                  </p>
                  <div className="space-y-3">
                    {car.availability.bookedDates.map((booking, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-dark-700 p-3 rounded-xl"
                      >
                        <span className="text-sm font-semibold text-slate-700 dark:text-dark-300">
                          {new Date(booking.startDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" }
                          )}{" "}
                          -{" "}
                          {new Date(booking.endDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                            booking.status === "ACTIVE"
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Car Specifications */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-dark-700">
              <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-5 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary-600" />
                Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {car.fuelType && (
                  <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border-2 border-primary-100 dark:border-primary-900">
                    <Fuel className="w-6 h-6 text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        Fuel Type
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.fuelType}
                      </p>
                    </div>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 p-4 rounded-xl border-2 border-slate-100 dark:border-dark-600">
                    <Settings className="w-6 h-6 text-slate-600 dark:text-dark-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        Transmission
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.transmission}
                      </p>
                    </div>
                  </div>
                )}
                {car.seats && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border-2 border-emerald-100 dark:border-emerald-900">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        Seats
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.seats}
                      </p>
                    </div>
                  </div>
                )}
                {car.mileage && (
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900">
                    <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        KM Driven
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                )}
                {isForSale && typeof car.ownersCount === 'number' && (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 p-4 rounded-xl border-2 border-slate-100 dark:border-dark-700">
                    <Users className="w-6 h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        Previous Owners
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.ownersCount} {car.ownersCount === 1 ? 'owner' : 'owners'}
                      </p>
                    </div>
                  </div>
                )}
                {car.color && (
                  <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-100 dark:border-purple-900">
                    <Palette className="w-6 h-6 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                        Color
                      </p>
                      <p className="font-bold text-dark-900 dark:text-white">
                        {car.color}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border-2 border-amber-100 dark:border-amber-900">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-0.5">
                      Year
                    </p>
                    <p className="font-bold text-dark-900 dark:text-white">
                      {car.year}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information (for used cars) */}
            {isForSale && car.seller && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-dark-700">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-5 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-600" />
                  Seller Information
                </h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-dark-700 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 dark:text-dark-400 mb-1">
                      Name
                    </p>
                    <p className="font-bold text-lg text-dark-900 dark:text-white">
                      {car.seller.name}
                    </p>
                  </div>
                  {car.seller.email && (
                    <a
                      href={`mailto:${car.seller.email}`}
                      className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl transition hover:bg-primary-100 dark:hover:bg-primary-900/30 border-2 border-primary-100 dark:border-primary-900"
                    >
                      <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <span className="text-primary-700 dark:text-primary-400 font-semibold truncate">
                        {car.seller.email}
                      </span>
                    </a>
                  )}
                  {car.seller.phone && (
                    <a
                      href={`tel:${car.seller.phone}`}
                      className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl transition hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-2 border-emerald-100 dark:border-emerald-900"
                    >
                      <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        {car.seller.phone}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
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
