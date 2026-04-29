import type { EditableFlightFields, Flight } from "../types";

export async function saveFlightChanges(
  flight: Flight,
  changes: EditableFlightFields,
): Promise<Flight> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));

  if (Math.random() < 0.1) {
    throw new Error("Simulated save failed.");
  }

  return {
    ...flight,
    ...changes,
  };
}
