"use client";

import { JsonPanel } from "@/components/dashboard/json-panel";

type Panel = { title: string; subtitle?: string; data: unknown; defaultOpen?: boolean };

export function JsonApiSection({
  heading,
  panels,
}: {
  heading: string;
  panels: Panel[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {heading}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {panels.map((p) => (
          <JsonPanel
            key={p.title}
            title={p.title}
            subtitle={p.subtitle}
            data={p.data}
            defaultOpen={p.defaultOpen}
          />
        ))}
      </div>
    </section>
  );
}
