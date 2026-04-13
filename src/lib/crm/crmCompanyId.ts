/** Normalize `companies.crm_company_id` / CRM picker values for comparison and `<select>`. */
export function normalizeCrmCompanyId(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export function crmCompanyIdsMatch(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): boolean {
  const na = normalizeCrmCompanyId(a);
  const nb = normalizeCrmCompanyId(b);
  if (na === null && nb === null) return true;
  if (na === null || nb === null) return false;
  return na === nb;
}
