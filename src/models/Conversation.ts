export interface Conversation {
  id?: number;
  mobile_number?: string;
  company_id?: number | string;
  port_id?: number | string;
  gsm_id?: number | string;
  status?: "active" | "archived" | "closed" | string;
  messages?: unknown[];
  [key: string]: unknown;
}

export interface IndexConversationParams {
  mobile_number?: string;
  company_id?: number | string;
  port_id?: number | string;
  gsm_id?: number | string;
  status?: string;
  per_page?: number;
}
