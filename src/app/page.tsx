import { redirect } from "next/navigation";
import { appPaths } from "@/lib/navigation/appPaths";

export default function Home() {
  redirect(appPaths.dashboard);
}
