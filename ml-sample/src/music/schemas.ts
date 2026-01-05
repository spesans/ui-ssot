import { z } from "zod";

export const TagSchema = z.object({
  id: z.string(),
  labels: z
    .object({
      en: z.string(),
      ja: z.string(),
    })
    .catchall(z.string().optional()),
  group: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const TrackSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  isrc: z.string().optional(),
  artist: z.string().optional(),
  albumArtSrc: z.string(),
  audioSrc: z.string(),
  description: z.string().optional(),
  bpm: z.number().optional(),
  tags: z.array(z.string()).optional(),
  license: z.object({
    licenseId: z.string(),
    requiresAgreement: z.boolean(),
    note: z.string().optional(),
    clearanceUrl: z.url().optional(),
  }),
  downloads: z.array(
    z.object({
      downloadId: z.string(),
      variant: z.enum(["full", "loop", "short"]),
      label: z.string(),
      format: z.string(),
      sizeBytes: z.number().optional(),
      directUrl: z.string().optional(),
    }),
  ),
});

export type Track = z.infer<typeof TrackSchema>;

export const TracksPublicManifestSchema = z.object({
  schemaVersion: z.number(),
  generatedAt: z.string(),
  tags: z.array(TagSchema).optional(),
  tracks: z.array(TrackSchema),
});

export type TracksPublicManifest = z.infer<typeof TracksPublicManifestSchema>;
