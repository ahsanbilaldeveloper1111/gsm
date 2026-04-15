export interface Port {
  id?: number;
  port?: number | string;
  gsm_id?: number | string;
  company_id?: number | string | null;
  mobile_number?: string;
  sim_status?: string;
  operator?: string;
  iccid?: string;
  imei?: string;
  imsi?: string;
  [key: string]: unknown;
}

export interface IndexPortParams {
  gsm_id?: number | string;
  gsm?: number | string;
  port?: number | string;
  sim_status?: string;
  operator?: string;
  company_id?: number | string;
  company?: number | string;
  port_id?: number | string;
  mobile_number?: string;
  iccid?: string;
  imei?: string;
  imsi?: string;
  data_type?: string;
  perPage?: number;
  page?: number;
  isExport?: boolean | number;
  draw?: number;
  start?: number;
  length?: number;
}
