import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsViewTracker } from "@/components/analytics-view-tracker";
import { ReaderNav } from "@/components/reader-nav";
import { ReaderProgress } from "@/components/reader-progress";
import { ReaderSections } from "@/components/reader-sections";
import { ScrollMemory } from "@/components/scroll-memory";
import { getCanonicalDocBySlug, getCanonicalManifest } from "@/lib/content";
import type { CommentaryEntry } from "@/types/content";

export function generateStaticParams() {
  return getCanonicalManifest().map((doc) => ({ docSlug: doc.slug }));
}

type Props = {
  params: Promise<{ docSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { docSlug } = await params;
  const doc = await getCanonicalDocBySlug(docSlug);
  if (!doc) {
    return {
      title: "Document Not Found • MET4MORFOSES",
      description: "Requested canonical text is unavailable.",
    };
  }

  return {
    title: `${doc.title} • MET4MORFOSES`,
    description: `Canonical inline edition for ${doc.title}.`,
  };
}

async function getCommentary(docSlug: string): Promise<CommentaryEntry[]> {
  try {
    const root = process.cwd();
    const path = join(root, "src/data/commentary.json");
    const all = JSON.parse(await readFile(path, "utf8")) as CommentaryEntry[];
    return all.filter((c) => c.docSlug === docSlug);
  } catch {
    return [];
  }
}

export default async function ReadDocPage({ params }: Props) {
  const { docSlug } = await params;
  const doc = await getCanonicalDocBySlug(docSlug);
  const commentary = await getCommentary(docSlug);

  if (!doc) {
    notFound();
  }

  return (
    <>
      <AnalyticsViewTracker docSlug={doc.slug} mode="reader" />
      <ReaderProgress docSlug={doc.slug} />
      <ScrollMemory keyName={`read-${doc.slug}`} />

      <section className="hero reader-hero">
        <p className="eyebrow">Canonical Reader</p>
        <h1>{doc.title}</h1>
        <p>
          Word count: {doc.wordCount.toLocaleString()} • Source: <a href={doc.sourcePdf}>PDF</a>
        </p>
      </section>

      <div className="reader-layout">
        <ReaderNav docSlug={doc.slug} sections={doc.sections} />
        <ReaderSections docSlug={doc.slug} sections={doc.sections} commentary={commentary} />
      </div>

      <section className="reader-next-links">
        {getCanonicalManifest().map((entry) => (
          <Link href={`/read/${entry.slug}`} key={entry.slug}>
            {entry.title}
          </Link>
        ))}
      </section>
    </>
  );
}
