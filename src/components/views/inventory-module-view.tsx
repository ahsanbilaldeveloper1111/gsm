"use client";

import { JsonApiSection } from "@/components/views/json-api-section";
import {
  useInventoryItemsList,
  useInventoryLocations,
  useInventoryStats,
  useInventorySummary,
  useInventorySuppliers,
} from "@/hooks/inventory/use-inventory-endpoints";
import { useInventory } from "@/hooks/inventory/use-inventory";

function panelPayload(q: {
  isError: boolean;
  error: unknown;
  data: unknown;
}) {
  if (q.isError) return { error: String(q.error) };
  return q.data;
}

function subtitle(q: { isFetching: boolean; isError: boolean }) {
  if (q.isFetching) return "Loading…";
  if (q.isError) return "Error";
  return "OK";
}

export function InventoryModuleView() {
  const list = useInventory();
  const summary = useInventorySummary();
  const stats = useInventoryStats();
  const locations = useInventoryLocations();
  const suppliers = useInventorySuppliers();
  const items = useInventoryItemsList();

  return (
    <JsonApiSection
      heading="Inventory endpoints"
      panels={[
        {
          title: "GET …/inventory (index)",
          subtitle: subtitle(list),
          data: panelPayload(list),
          defaultOpen: true,
        },
        {
          title: "GET …/inventory/summary",
          subtitle: subtitle(summary),
          data: panelPayload(summary),
        },
        {
          title: "GET …/inventory/stats",
          subtitle: subtitle(stats),
          data: panelPayload(stats),
        },
        {
          title: "GET …/inventory/locations",
          subtitle: subtitle(locations),
          data: panelPayload(locations),
        },
        {
          title: "GET …/inventory/suppliers",
          subtitle: subtitle(suppliers),
          data: panelPayload(suppliers),
        },
        {
          title: "GET …/inventory/items",
          subtitle: subtitle(items),
          data: panelPayload(items),
        },
      ]}
    />
  );
}
