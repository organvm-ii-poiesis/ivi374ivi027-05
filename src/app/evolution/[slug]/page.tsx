import { notFound } from "next/navigation";
import { EvolutionView } from "@/components/evolution-view";
import { getEvolutionaryDocBySlug, getAllEvolutionaryDocs } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const docs = await getAllEvolutionaryDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function EvolutionPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getEvolutionaryDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main>
      <EvolutionView doc={doc} />
    </main>
  );
}
