export interface Sim {
  id?: number;
  sim_number?: string;
  iccid?: string;
  status?: "active" | "inactive" | string;
  gsm_id?: number | string | null;
  company_id?: number | string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface IndexSimParams {
  status?: string;
  sim_number?: string;
  iccid?: string;
  gsm_id?: number | string;
  company_id?: number | string;
  page?: number;
  perPage?: number;
}

export interface CreateSimPayload {
  sim_number: string;
  iccid: string;
  gsm_id?: number | string;
  company_id?: number | string;
}

export interface UpdateSimPayload extends CreateSimPayload {
  status: "active" | "inactive";
}
