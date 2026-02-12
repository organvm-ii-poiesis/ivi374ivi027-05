export type CanonicalSection = {
  id: string;
  title: string;
  order: number;
  anchor: string;
  body: string;
};

export type CanonicalDoc = {
  id: string;
  slug: string;
  title: string;
  order: number;
  sourcePdf: string;
  markdownPath: string;
  wordCount: number;
  sections: CanonicalSection[];
};

export type VersionData = {
  draft: number;
  date: string;
  sourcePdf: string;
  wordCount: number;
  sections: CanonicalSection[];
};

export type CommentaryEntry = {
  id: string;
  docSlug: string;
  sectionAnchor: string; // The anchor this commentary attaches to
  scholar: string;       // e.g. "Author", "AI Analyst"
  body: string;
};

export type EvolutionaryDoc = {
  slug: string;
  title: string;
  versions: VersionData[];
};

export type NarrativeNode = {
  id: string;
  label: string;
  theme: string;
  linkedDocSlugs: string[];
  linkedSections: string[];
  position: {
    x: number;
    y: number;
  };
  isTrending?: boolean;
  viewCount?: number;
};

export type FeedItem = {
  id: string;
  timestampOrder: number;
  nodeId: string;
  contentRef: string;
  mediaRefs: string[];
  tags: string[];
};

export type MirrorAsset = {
  id: string;
  relativePath: string;
  fileName: string;
  ext:
    | "pdf"
    | "pages"
    | "numbers"
    | "docx"
    | "zip"
    | "txt"
    | "json"
    | "jpg"
    | "jpeg"
    | "png"
    | "gif"
    | "webp"
    | "unknown";
  sizeBytes: number;
  modifiedAt: string;
  sourceFolder: string;
  downloadUrl: string;
  sha256: string;
};

export type AnalyticsEventName =
  | "mode_viewed"
  | "node_opened"
  | "section_opened"
  | "doc_progress"
  | "download_started"
  | "download_completed"
  | "mode_switched";

export type AnalyticsEvent = {
  eventName: AnalyticsEventName;
  mode?: "node-map" | "feed" | "scroll" | "reader" | "archive" | "about" | "oracle" | "evolution";
  docSlug?: string;
  sectionId?: string;
  nodeId?: string;
  sessionId?: string;
  ts: string;
  value?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type AnalyticsPayload = Omit<AnalyticsEvent, "ts"> & {
  ts?: string;
};
