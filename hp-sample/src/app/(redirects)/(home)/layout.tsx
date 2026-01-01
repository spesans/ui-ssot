import type { Metadata } from "next";
import { createRedirectMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRedirectMetadata("/");

export default function HomeRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
