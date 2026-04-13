import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment confirmation",
};

export default function PublicPaymentSuccessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
