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
    items: [{ label: "Dashboard", href: appPaths.dashboard }],
  },
  {
    title: "Audit logs",
    items: [{ label: "Audit logs", href: appPaths.auditLogs }],
  },
  {
    title: "GSM",
    items: [{ label: "GSM", href: appPaths.gsm }],
  },
  {
    title: "GSM companies",
    items: [{ label: "GSM companies", href: appPaths.gsmCompanies }],
  },
  {
    title: "Client GSM profiling",
    items: [{ label: "Client GSM profiling", href: appPaths.clientGsmProfiling }],
  },
  {
    title: "Ports",
    items: [{ label: "Ports", href: appPaths.ports }],
  },
  {
    title: "Notifications",
    items: [{ label: "Notifications", href: appPaths.notifications }],
  },
  {
    title: "Conversations",
    items: [{ label: "Conversations", href: appPaths.conversations }],
  },
  {
    title: "USSD",
    items: [{ label: "USSD", href: appPaths.ussd }],
  },
  {
    title: "Sync ports",
    items: [{ label: "Sync ports", href: appPaths.syncPorts }],
  },
  {
    title: "SIMs",  
    items: [{ label: "SIMs", href: appPaths.sims }],
  },
  {
    title: "Outbox",
    items: [{ label: "Outbox", href: appPaths.outbox }],
  },
  {
    title: "Inbox",
    items: [{ label: "Inbox", href: appPaths.inbox }],
  },
  {
    title: "CDR",
    items: [{ label: "CDR", href: appPaths.cdr }],
  },
  
];
