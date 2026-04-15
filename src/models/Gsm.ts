export interface GsmDevice {
  id?: number;
  name?: string;
  ip_address?: string;
  username?: string;
  status?: "active" | "inactive" | string;
  company?: number | string | null;
  company_id?: number | string | null;
  device_status?: string;
  total_port?: number;
  [key: string]: unknown;
}

export interface IndexGsmParams {
  company?: number | string;
  status?: string;
  ip_address?: string;
  name?: string;
  search?: string;
  device_status?: string;
  data_type?: string;
  perPage?: number;
  page?: number;
  isExport?: boolean | number;
}

export interface CreateGsmPayload {
  name: string;
  ip_address: string;
  username: string;
  password: string;
  company?: number | string;
}

export interface UpdateGsmPayload extends CreateGsmPayload {
  status: "active" | "inactive";
}
