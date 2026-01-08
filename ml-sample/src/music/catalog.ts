import { SAMPLE_TAGS, SAMPLE_TRACKS } from "@/music/sampleCatalog";

export function getCatalog() {
  return {
    tags: SAMPLE_TAGS,
    tracks: SAMPLE_TRACKS,
  };
}
