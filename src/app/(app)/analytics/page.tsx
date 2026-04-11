import { redirect } from "next/navigation";
import { appPaths } from "@/lib/navigation/appPaths";

/** Analytics charts and trends live on the dashboard (`#analytics`). */
export default function AnalyticsPage() {
  redirect(`${appPaths.dashboard}#analytics`);
}
