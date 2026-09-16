import { TIME_SLOT_PRESETS } from "./constants";

export type TabType = "MY_BOOKINGS" | "SCHEDULE";

export type NativePickerMode = "date" | "start" | "end" | null;

export interface DurationInfo {
  durationText: string;
  isValid: boolean;
  minutes: number;
}

export interface SportIconData {
  name: "award" | "activity" | "target" | "music" | "zap" | "camera" | "flag";
  label: string;
}

export type TimeSlotPreset = (typeof TIME_SLOT_PRESETS)[number];
