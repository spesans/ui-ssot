import type { Metadata } from "next";
import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/about");

export default function AboutRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
