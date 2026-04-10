export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_active: boolean;
  // Backend uses is_base_currency; some older frontend code uses is_base
  is_base?: boolean;
  is_base_currency?: boolean;
  last_updated?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CurrencyRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
}

export interface CurrencyStats {
  total_currencies: number;
  active_currencies: number;
  base_currency: string;
  most_used_currency: string;
  exchange_rate_updates: number;
}

export interface CreateCurrencyData {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_active?: boolean;
  is_base?: boolean;
  is_base_currency?: boolean;
}

export interface UpdateCurrencyData {
  name?: string;
  symbol?: string;
  exchange_rate?: number;
  is_active?: boolean;
  is_base?: boolean;
  is_base_currency?: boolean;
}

export interface IndexCurrencyParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  is_base?: boolean;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
}
