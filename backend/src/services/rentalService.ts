import prisma from '../db/prisma';

export interface CreateRentalData {
  carId: string;
  buyerId: string;
  startDate: Date;
  endDate: Date;
}

export interface RentalValidationResult {
  isValid: boolean;
  error?: string;
  totalDays?: number;
  totalAmount?: number;
  dailyPrice?: number;
}

export const validateRentalDates = (startDate: Date, endDate: Date): RentalValidationResult => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Check if start date is in the past
  if (start < now) {
    return {
      isValid: false,
      error: 'Start date cannot be in the past',
    };
  }

  // Check if end date is before start date
  if (end < start) {
    return {
      isValid: false,
      error: 'End date must be after start date',
    };
  }

  // Calculate days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

  if (diffDays < 1) {
    return {
      isValid: false,
      error: 'Rental period must be at least 1 day',
    };
  }

  if (diffDays > 365) {
    return {
      isValid: false,
      error: 'Rental period cannot exceed 365 days',
    };
  }

  return {
    isValid: true,
    totalDays: diffDays,
  };
};

export const checkCarAvailability = async (
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId?: string
): Promise<{ isAvailable: boolean; error?: string }> => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      rentals: {
        where: {
          status: {
            in: ['PENDING', 'ACTIVE'],
          },
          NOT: excludeRentalId ? { id: excludeRentalId } : undefined,
        },
      },
    },
  });

  if (!car) {
    return { isAvailable: false, error: 'Car not found' };
  }

  if (car.status !== 'AVAILABLE') {
    return { isAvailable: false, error: 'Car is not available for rent' };
  }

  if (!car.isForRent) {
    return { isAvailable: false, error: 'This car is not available for rent' };
  }

  if (!car.rentalPrice) {
    return { isAvailable: false, error: 'Rental price not set for this car' };
  }

  // Check for overlapping rentals
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const rental of car.rentals) {
    const rentalStart = new Date(rental.startDate);
    const rentalEnd = new Date(rental.endDate);

    // Check for overlap
    if (
      (start >= rentalStart && start <= rentalEnd) ||
      (end >= rentalStart && end <= rentalEnd) ||
      (start <= rentalStart && end >= rentalEnd)
    ) {
      return {
        isAvailable: false,
        error: 'Car is already rented for the selected dates',
      };
    }
  }

  return { isAvailable: true };
};

export const calculateRentalPrice = (dailyPrice: number, totalDays: number): number => {
  return dailyPrice * totalDays;
};

export const createRentalBooking = async (data: CreateRentalData) => {
  const { carId, buyerId, startDate, endDate } = data;

  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);

  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(23, 59, 59, 999);

  // Validate dates
  const dateValidation = validateRentalDates(startDate, endDate);
  if (!dateValidation.isValid) {
    throw new Error(dateValidation.error);
  }

  // Check car availability
  const availability = await checkCarAvailability(carId, normalizedStart, normalizedEnd);
  if (!availability.isAvailable) {
    throw new Error(availability.error);
  }

  // Get car details
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car || !car.rentalPrice) {
    throw new Error('Car or rental price not found');
  }

  // Calculate total amount
  const totalAmount = calculateRentalPrice(car.rentalPrice, dateValidation.totalDays!);

  const now = new Date();
  const rentalStatus = normalizedStart <= now && normalizedEnd >= now ? 'ACTIVE' : 'PENDING';

  // Create rental booking
  const rental = await prisma.rental.create({
    data: {
      carId,
      buyerId,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      totalDays: dateValidation.totalDays!,
      dailyPrice: car.rentalPrice,
      totalAmount,
      status: rentalStatus,
      paymentStatus: 'PENDING',
    },
    include: {
      car: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          isAadhaarVerified: true,
        },
      },
    },
  });

  if (rentalStatus === 'ACTIVE') {
    await prisma.car.update({
      where: { id: carId },
      data: { status: 'RENTED' },
    });
  }

  return rental;
};

export const updateRentalStatus = async (rentalId: string, status: string) => {
  const rental = await prisma.rental.update({
    where: { id: rentalId },
    data: { status },
  });
  return rental;
};

