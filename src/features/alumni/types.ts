export interface AlumniItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department: string;
  batch?: string | null;
  graduationBatch?: string | null;
  graduationYear?: number | null;
  passingYear?: number | null;
  degree?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  currentRole?: string | null;
  designation?: string | null;
  skills?: string[];
  linkedInUrl?: string | null;
  linkedinUrl?: string | null;
  personalWebsiteUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAlumniInput {
  name: string;
  email: string;
  phone?: string;
  department: string;
  graduationBatch: string;
  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  linkedInUrl?: string;
  imageUrl?: string;
}
