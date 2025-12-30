import { z } from "zod";

const DEFAULT_SITE_URL = "https://example.com";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default(DEFAULT_SITE_URL),
  NEXT_PUBLIC_CONTACT_ENDPOINT: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof PublicEnvSchema>;

function readPublicEnv(): PublicEnv {
  const raw: Record<string, unknown> = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_ENDPOINT: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
  };

  return PublicEnvSchema.parse(raw);
}

export const publicEnv = readPublicEnv();
