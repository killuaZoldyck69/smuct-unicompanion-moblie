import { TIME_SLOT_PRESETS } from "./constants";

export type TabType = "REQUESTS" | "SCHEDULE" | "MY_BOOKINGS";

export type NativePickerMode = "date" | "start" | "end" | null;

export interface DurationInfo {
  durationText: string;
  isValid: boolean;
  minutes: number;
}

export type SportType =
  | "cricket"
  | "football"
  | "racket"
  | "athletics"
  | "event"
  | "media"
  | "general";

export interface SportIconData {
  type: SportType;
  label: string;
}

export type TimeSlotPreset = (typeof TIME_SLOT_PRESETS)[number];
