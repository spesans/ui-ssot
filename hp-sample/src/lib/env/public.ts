import { z } from "zod";

const OptionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.url().optional());

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_CONTACT_ENDPOINT: OptionalUrl,
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
