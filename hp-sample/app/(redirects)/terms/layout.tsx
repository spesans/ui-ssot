import type { Metadata } from "next";

import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/terms");

export default function TermsRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
