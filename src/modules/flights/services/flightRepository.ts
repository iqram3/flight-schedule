import type { FlightDataset } from "../types";

export async function getFlights(): Promise<FlightDataset> {
  const response = await fetch("/flights.json");

  if (!response.ok) {
    throw new Error("Flight dataset could not be loaded.");
  }

  return response.json() as Promise<FlightDataset>;
}
