import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FCUS Knock-Out || FC Ultimate Showdown",
  description: "Manage competitive online tournaments for FC 25",
  icons: "/icon.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
