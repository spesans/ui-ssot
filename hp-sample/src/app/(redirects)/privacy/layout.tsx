import type { Metadata } from "next";
import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/privacy");

export default function PrivacyRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
