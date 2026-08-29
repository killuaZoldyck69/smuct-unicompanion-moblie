export interface AlumniItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  department: string;
  graduationBatch: string;
  graduationYear?: number | null;
  currentCompany?: string | null;
  currentRole?: string | null;
  linkedInUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string;
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
