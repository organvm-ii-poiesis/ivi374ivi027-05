import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="hero">
      <p className="eyebrow">404</p>
      <h1>Passage Not Found</h1>
      <p>The requested document or section does not exist in this canonical build.</p>
      <Link href="/">Return to Node Map</Link>
    </section>
  );
}
