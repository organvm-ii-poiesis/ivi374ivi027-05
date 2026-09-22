import { getCanonicalManifest } from "@/lib/content";

/** Public reader metadata only; manuscript bodies and local file paths stay out. */
export function GET() {
  const documents = getCanonicalManifest().map((doc) => ({
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    order: doc.order,
    wordCount: doc.wordCount,
    sectionCount: doc.sections.length,
    readerUrl: `/read/${encodeURIComponent(doc.slug)}`,
  }));

  return Response.json(documents);
}
