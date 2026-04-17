import type { AppPath } from "@/lib/navigation/appPaths";
import { appPaths } from "@/lib/navigation/appPaths";

export type NavItem = {
  label: string;
  href: AppPath;
  /** Shown under the label in the sidebar (muted). */
  description?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: appPaths.dashboard },
       { label: "GSM", href: appPaths.gsm },
       { label: "GSM companies", href: appPaths.gsmCompanies },
       { label: "Client GSM profiling", href: appPaths.clientGsmProfiling },
       { label: "Ports", href: appPaths.ports },
       { label: "SIMs", href: appPaths.sims },
       { label: "Outbox", href: appPaths.outbox },
       { label: "Inbox", href: appPaths.inbox },
       { label: "CDR", href: appPaths.cdr },
       { label: "Conversations", href: appPaths.conversations },
       { label: "USSD", href: appPaths.ussd },
       { label: "Sync ports", href: appPaths.syncPorts },
       { label: "SIMs", href: appPaths.sims },
      //  { label: "Outbox", href: appPaths.outbox },
       { label: "Inbox", href: appPaths.inbox },
       { label: "CDR", href: appPaths.cdr },
       { label: "Notifications", href: appPaths.notifications }, 

    ],
  },
  
  
];
