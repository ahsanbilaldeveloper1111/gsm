import { CurrenciesView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Currencies" };

export default function CurrenciesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Currencies"
        description="Supported currencies, FX rates, and conversions."
      />
      <div className="mt-8">
        <CurrenciesView />
      </div>
    </PageFrame>
  );
}
