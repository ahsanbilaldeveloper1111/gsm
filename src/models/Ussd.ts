export interface UssdRow {
  id?: number;
  ip_address?: string;
  text?: string;
  created_at?: string;
  port?: {
    id?: number | string;
    port_number?: number | string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface IndexUssdParams {
  gsm_id?: number | string;
  port_id?: number | string;
  draw?: number;
  start?: number;
  length?: number;
  page?: number;
  perPage?: number;
}
