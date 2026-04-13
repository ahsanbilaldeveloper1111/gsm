import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default function PublicPaymentCancelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
