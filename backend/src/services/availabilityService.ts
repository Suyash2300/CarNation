import prisma from '../db/prisma';

export interface AvailabilityInfo {
  status: 'AVAILABLE' | 'RENTED' | 'BOOKED_UNTIL';
  isCurrentlyRented: boolean;
  nextAvailableDate?: string; // ISO date string
  bookedUntil?: string; // ISO date string
  bookedDates: Array<{
    startDate: string;
    endDate: string;
    status: string;
  }>;
  activeRentalsCount: number;
}

export const getCarAvailability = async (carId: string): Promise<AvailabilityInfo> => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Get all active/pending rentals for this car
  const rentals = await prisma.rental.findMany({
    where: {
      carId,
      status: {
        in: ['PENDING', 'ACTIVE'],
      },
    },
    orderBy: {
      startDate: 'asc',
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });

  if (rentals.length === 0) {
    return {
      status: 'AVAILABLE',
      isCurrentlyRented: false,
      bookedDates: [],
      activeRentalsCount: 0,
    };
  }

  // Check if car is currently rented (rental period includes today)
  const isCurrentlyRented = rentals.some((rental) => {
    const start = new Date(rental.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rental.endDate);
    end.setHours(23, 59, 59, 999);

    return now >= start && now <= end;
  });

  // Find the latest end date
  const latestEndDate = rentals.reduce((latest, rental) => {
    const rentalEnd = new Date(rental.endDate);
    return rentalEnd > latest ? rentalEnd : latest;
  }, new Date(rentals[0].endDate));

  // Calculate next available date (day after latest booking ends)
  const nextAvailableDate = new Date(latestEndDate);
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
  nextAvailableDate.setHours(0, 0, 0, 0);

  // Format booked dates
  const bookedDates = rentals.map((rental) => ({
    startDate: rental.startDate.toISOString(),
    endDate: rental.endDate.toISOString(),
    status: rental.status,
  }));

  // Determine status
  let status: 'AVAILABLE' | 'RENTED' | 'BOOKED_UNTIL';
  if (isCurrentlyRented) {
    status = 'RENTED';
  } else if (nextAvailableDate > now) {
    status = 'BOOKED_UNTIL';
  } else {
    status = 'AVAILABLE';
  }

  return {
    status,
    isCurrentlyRented,
    nextAvailableDate: nextAvailableDate.toISOString().split('T')[0], // YYYY-MM-DD format
    bookedUntil: latestEndDate.toISOString().split('T')[0],
    bookedDates,
    activeRentalsCount: rentals.length,
  };
};

export const getUnavailableDates = async (
  carId: string,
  excludeRentalId?: string
): Promise<string[]> => {
  const rentals = await prisma.rental.findMany({
    where: {
      carId,
      status: {
        in: ['PENDING', 'ACTIVE'],
      },
      NOT: excludeRentalId ? { id: excludeRentalId } : undefined,
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  const unavailableDates: string[] = [];

  rentals.forEach((rental) => {
    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);

    // Generate all dates in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!unavailableDates.includes(dateStr)) {
        unavailableDates.push(dateStr);
      }
    }
  });

  return unavailableDates.sort();
};
