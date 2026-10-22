import { AlumniItem } from "@/services/alumni-service";
import { CreateAlumniInput } from "@/features/alumni/types";

export type AlumniSortOption = "recent" | "name";

export interface DepartmentOption {
  label: string;
  value: string | null;
  count: number;
}

export interface DeptTheme {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export interface AvatarTheme {
  bg: string;
  border: string;
  text: string;
}

export { AlumniItem, CreateAlumniInput };
