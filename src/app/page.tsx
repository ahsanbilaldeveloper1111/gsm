import { redirect } from "next/navigation";
import { appPaths } from "@/lib/navigation/app-paths";

export default function Home() {
  redirect(appPaths.dashboard);
}
