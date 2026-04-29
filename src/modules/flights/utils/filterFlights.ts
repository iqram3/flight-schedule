import type { Flight, FlightFilters } from "../types";

const toTime = (date: string) => (date ? new Date(`${date}T00:00:00`).getTime() : undefined);

function overlapsOperationalPeriod(flight: Flight, fromDate: string, toDate: string) {
  const selectedStart = toTime(fromDate) ?? Number.NEGATIVE_INFINITY;
  const selectedEnd = toTime(toDate) ?? Number.POSITIVE_INFINITY;
  const flightStart = toTime(flight.startDate) ?? Number.NEGATIVE_INFINITY;
  const flightEnd = toTime(flight.endDate) ?? Number.POSITIVE_INFINITY;

  return flightStart <= selectedEnd && flightEnd >= selectedStart;
}

export function filterFlights(flights: Flight[], filters: FlightFilters, search: string) {
  const query = search.trim().toLowerCase();

  return flights.filter((flight) => {
    const matchesSearch =
      !query ||
      flight.flightNumber.toLowerCase().includes(query) ||
      flight.origin.toLowerCase().includes(query) ||
      flight.destination.toLowerCase().includes(query);

    const matchesDates =
      (!filters.fromDate && !filters.toDate) ||
      overlapsOperationalPeriod(flight, filters.fromDate, filters.toDate);

    const matchesDays =
      filters.days.length === 0 ||
      filters.days.some((day) => flight.daysOfOperation.includes(day));

    const matchesStatus = !filters.status || flight.status === filters.status;
    const matchesAoc = !filters.aoc || flight.aoc === filters.aoc;
    const matchesBodyType = !filters.bodyType || flight.bodyType === filters.bodyType;

    return (
      matchesSearch &&
      matchesDates &&
      matchesDays &&
      matchesStatus &&
      matchesAoc &&
      matchesBodyType
    );
  });
}
