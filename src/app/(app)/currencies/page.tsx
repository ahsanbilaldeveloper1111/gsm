import { CurrenciesView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
