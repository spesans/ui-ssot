import type { Metadata } from "next";

import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/legal");

export default function LegalRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
