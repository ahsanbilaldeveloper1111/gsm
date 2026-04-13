/** Row from main-app reseller list (`GET /resellers/from-main-app`). */
export type MainAppResellerItem = {
  id?: string | number;
  identifier?: string;
  tenant_id?: string;
  name?: string;
  title?: string;
  email?: string;
};

export function mainAppResellerIdentifier(r: MainAppResellerItem): string {
  return String(r.identifier ?? r.tenant_id ?? r.id ?? "").trim();
}
