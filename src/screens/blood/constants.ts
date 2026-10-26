import { Platform } from "react-native";

export const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  crimson: "#be123c",
  roseBg: "#fff1f2",
  cardRadius: 24,
  pillRadius: 9999,
  subtleBorder: "rgba(0, 0, 0, 0.04)",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
} as const;

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const BLOOD_GROUPS = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
] as const;

export const URGENCY_LEVELS = ["High", "Medium", "Standard"] as const;

export type BloodFilterType = "URGENT" | "ALL" | "FULFILLED";

export interface BloodFeedCounts {
  urgent: number;
  active: number;
  fulfilled: number;
  total: number;
}

export interface HospitalLocationItem {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  address: string;
}

export const POPULAR_HOSPITALS: HospitalLocationItem[] = [
  {
    name: "Uttara Adhunik Medical College Hospital",
    area: "Uttara Sector 9",
    latitude: 23.8748,
    longitude: 90.3967,
    address: "House 34, Road 4, Sector 9, Uttara, Dhaka",
  },
  {
    name: "Kuwait Bangladesh Friendship Hospital",
    area: "Uttara Sector 6",
    latitude: 23.8647,
    longitude: 90.4042,
    address: "Issha Kha Avenue, Sector 6, Uttara, Dhaka",
  },
  {
    name: "Kurmitola General Hospital",
    area: "Dhaka Cantonment",
    latitude: 23.8193,
    longitude: 90.4103,
    address: "Airport Road, Dhaka Cantonment, Dhaka",
  },
  {
    name: "Dhaka Medical College Hospital (DMCH)",
    area: "Bakshibazar",
    latitude: 23.7258,
    longitude: 90.3976,
    address: "Secretariat Road, Bakshibazar, Dhaka",
  },
  {
    name: "Evercare Hospital Dhaka",
    area: "Bashundhara R/A",
    latitude: 23.8103,
    longitude: 90.4312,
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
  },
  {
    name: "Square Hospital",
    area: "Panthapath",
    latitude: 23.7533,
    longitude: 90.3816,
    address: "18/F Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, Dhaka",
  },
  {
    name: "United Hospital",
    area: "Gulshan-2",
    latitude: 23.8051,
    longitude: 90.4158,
    address: "Plot 15, Road 71, Gulshan-2, Dhaka",
  },
  {
    name: "Shaheed Suhrawardy Medical College Hospital",
    area: "Sher-e-Bangla Nagar",
    latitude: 23.7699,
    longitude: 90.3712,
    address: "Mirpur Road, Sher-e-Bangla Nagar, Dhaka",
  },
  {
    name: "BSMMU (PG Hospital)",
    area: "Shahbagh",
    latitude: 23.7389,
    longitude: 90.3948,
    address: "Shahbagh, Dhaka",
  },
  {
    name: "LabAid Specialized Hospital",
    area: "Dhanmondi",
    latitude: 23.7423,
    longitude: 90.3826,
    address: "House 06, Road 04, Dhanmondi, Dhaka",
  },
  {
    name: "Ibn Sina Medical College Hospital",
    area: "Kallyanpur",
    latitude: 23.7806,
    longitude: 90.3582,
    address: "1/1 B, Kallyanpur, Mirpur Road, Dhaka",
  },
  {
    name: "National Institute of Cardiovascular Diseases (NICVD)",
    area: "Sher-e-Bangla Nagar",
    latitude: 23.7712,
    longitude: 90.3701,
    address: "Sher-e-Bangla Nagar, Dhaka",
  },
];

export interface NewBloodPostForm {
  patientName: string;
  patientCondition: string;
  bloodGroup: string;
  bagsNeeded: number;
  location: string;
  urgency: string;
  contactPhone: string;
  hospitalName?: string;
  floor?: string;
  ward?: string;
  bed?: string;
  additionalLocationNotes?: string;
  latitude?: number;
  longitude?: number;
}

