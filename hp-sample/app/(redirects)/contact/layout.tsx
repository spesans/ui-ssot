import type { Metadata } from "next";

import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/contact");

export default function ContactRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
