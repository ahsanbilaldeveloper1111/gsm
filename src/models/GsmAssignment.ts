export interface GsmAssignment {
  id?: number;
  gsm_id?: number | string;
  company_id?: number | string;
  status?: "active" | "inactive" | string;
  assigned_ports?: number;
  created_at?: string;
  gsm?: {
    id?: number | string;
    name?: string;
    ip_address?: string;
    [key: string]: unknown;
  } | null;
  company?: {
    id?: number | string;
    name?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface IndexGsmAssignmentParams {
  gsm_id?: number | string;
  company_id?: number | string;
  page?: number;
  perPage?: number;
}
