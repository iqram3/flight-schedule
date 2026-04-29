export const DAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 7, short: "Sun", long: "Sunday" },
] as const;

import type { FlightFilters } from "./types";

export const DEFAULT_FILTERS: FlightFilters = {
  fromDate: "",
  toDate: "",
  days: [],
  status: "",
  aoc: "",
  bodyType: "",
};

export const VISIBLE_BATCH_SIZE = 500;
