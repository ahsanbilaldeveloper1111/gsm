export interface InboxRow {
  id?: number;
  number?: string;
  text?: string;
  created_at?: string;
  gsm?: {
    id?: number | string;
    name?: string;
    ip_address?: string;
    [key: string]: unknown;
  } | null;
  port?: {
    id?: number | string;
    port_number?: number | string;
    mobile_number?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface IndexInboxParams {
  gsm_id?: number | string;
  port_id?: number | string;
  sender?: string;
  message?: string;
  draw?: number;
  start?: number;
  length?: number;
  page?: number;
  perPage?: number;
}
