export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreateApplicationInput {
  name: string;
  email: string;
  company?: string | null;
  motivation: string;
}

export interface ApplicationEntity {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  motivation: string;
  status: ApplicationStatus;
  createdAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ApplicationRepository {
  create(input: CreateApplicationInput): Promise<ApplicationEntity>;
  listAll(params?: PaginationParams): Promise<PaginatedResult<ApplicationEntity>>;
  setStatus(id: string, status: ApplicationStatus): Promise<void>;
  findById(id: string): Promise<ApplicationEntity | null>;
}


