/**
 * Shape of `data` from `GET /api/dashboard` (telecom backend).
 * Backend may typo `profilling`; we read both spellings in the UI.
 */
export type DashboardAssignedPortItem = {
  port_number?: unknown;
  status?: unknown;
};

export type DashboardGsmAssignmentRow = {
  id?: number;
  device_status?: string | null;
  company_name?: string | null;
  gsm_name?: string | null;
  gsm_ip?: string | null;
  assigned_ports_data?: DashboardAssignedPortItem[];
  total_ports?: number;
  assigned_ports_count?: number;
  unassigned_ports_count?: number;
};

export type DashboardInboxRow = {
  ip_address?: string | null;
  message?: string | null;
  created_at?: string | null;
  port_number?: unknown;
  mobile_number?: unknown;
};

export type DashboardProfilingRow = {
  company?: string | null;
  gsm_count?: number;
  port_count?: number;
};

export type DashboardGsmPortsChart = {
  used_ports: number[];
  free_ports: number[];
  gsm_names: string[];
};

export type DashboardInboxByDayRow = {
  date?: string | null;
  count?: number | string | null;
};

export type TelecomDashboardData = {
  free_port?: number;
  registered_port?: number;
  unregistered_port?: number;
  total_port?: number;
  assigned_port?: number;
  inbox?: number;
  gsm_company_count?: number;
  total_gsm?: number;
  gsm_assignment?: DashboardGsmAssignmentRow[];
  inbox_list?: DashboardInboxRow[];
  /** Backend spelling */
  profilling?: DashboardProfilingRow[];
  profiling?: DashboardProfilingRow[];
  gsm_ports_chart?: DashboardGsmPortsChart;
  inbox_items_by_days?: DashboardInboxByDayRow[] | Record<string, unknown>[];
};

const METRIC_KEYS = [
  { key: "total_gsm", label: "Total GSM" },
  { key: "gsm_company_count", label: "GSM–company links" },
  { key: "total_port", label: "Total ports" },
  { key: "registered_port", label: "Registered ports" },
  { key: "unregistered_port", label: "Unregistered ports" },
  { key: "free_port", label: "Free ports" },
  { key: "assigned_port", label: "Assigned ports" },
  { key: "inbox", label: "Inbox messages" },
] as const;

export function telecomDashboardMetricCards(
  data: TelecomDashboardData,
): Array<{ key: string; label: string; value: string }> {
  return METRIC_KEYS.map(({ key, label }) => {
    const n = data[key];
    const value =
      typeof n === "number" && Number.isFinite(n) ? String(n) : "—";
    return { key, label, value };
  });
}

export function parseTelecomDashboardData(raw: unknown): TelecomDashboardData | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as TelecomDashboardData;
}

export function profilingRowsFromDashboard(
  data: TelecomDashboardData,
): DashboardProfilingRow[] {
  const rows = data.profilling ?? data.profiling;
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (r): r is DashboardProfilingRow =>
      r != null && typeof r === "object" && !Array.isArray(r),
  );
}

export function coerceInboxByDays(
  raw: TelecomDashboardData["inbox_items_by_days"],
): DashboardInboxByDayRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (row == null || typeof row !== "object" || Array.isArray(row)) {
      return {};
    }
    const o = row as Record<string, unknown>;
    const date =
      typeof o.date === "string"
        ? o.date
        : o.date != null
          ? String(o.date)
          : null;
    const count = o.count;
    return {
      date,
      count:
        typeof count === "number"
          ? count
          : typeof count === "string"
            ? count
            : count != null
              ? String(count)
              : undefined,
    };
  });
}
