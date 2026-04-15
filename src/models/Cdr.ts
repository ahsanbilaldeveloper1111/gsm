export interface CdrRow {
  id?: number;
  ip_address?: string;
  start_date?: string;
  answer_date?: string;
  duration?: string | number;
  source_number?: string;
  number?: string;
  destination_number?: string;
  direction?: string;
  ip?: string;
  codec?: string;
  hangup?: string;
  gsm_code?: string;
  bcch?: string;
  reason?: string;
  created_at?: string;
  port?: {
    id?: number | string;
    port_number?: number | string;
    mobile_number?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface IndexCdrParams {
  gsm_id?: number | string;
  port_id?: number | string;
  source_number?: string;
  destination_number?: string;
  start_date?: string;
  answer_date?: string;
  draw?: number;
  start?: number;
  length?: number;
  page?: number;
  perPage?: number;
}
