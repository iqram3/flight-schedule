import { DAYS } from "../constants";
import type { BodyType } from "../types";

export const formatBodyType = (bodyType: BodyType) =>
  bodyType === "wide_body" ? "Wide body" : "Narrow body";

export const formatDays = (days: number[]) =>
  DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.short)
    .join(", ");
