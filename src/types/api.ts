import type { CanonicalDoc, MirrorAsset } from "@/types/content";

export type AnalyticsApiResponse = {
  ok: boolean;
  forwarded: boolean;
  error?: string;
};

export type CanonicalManifestApiResponse = {
  ok: true;
  count: number;
  items: Array<
    Pick<
      CanonicalDoc,
      "id" | "slug" | "title" | "order" | "sourcePdf" | "markdownPath" | "wordCount"
    >
  >;
};

export type MirrorManifestApiResponse = {
  ok: true;
  count: number;
  items: Array<
    Pick<MirrorAsset, "id" | "relativePath" | "fileName" | "ext" | "sizeBytes" | "modifiedAt" | "downloadUrl" | "sha256">
  >;
};
