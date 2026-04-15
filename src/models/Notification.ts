export interface NotificationRow {
  id?: number;
  mobile_number?: string;
  tenant_id?: string | number;
  extension?: string;
  port_id?: number | string;
  gsm_id?: number | string;
  status?: string;
  notification_type?: string;
  message?: string;
  title?: string;
  metadata?: unknown;
  [key: string]: unknown;
}

export interface IndexNotificationParams {
  mobile_number?: string;
  tenant_id?: string | number;
  extension?: string;
  port_id?: number | string;
  gsm_id?: number | string;
  status?: string;
  notification_type?: string;
  date_from?: string;
  date_to?: string;
  sent_from?: string;
  sent_to?: string;
  page?: number;
  per_page?: number;
}
