import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6 py-20">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 gold-text font-serif text-5xl font-bold">This page is not on the rail.</h1>
      <p className="mt-4 text-muted">The cloth may have moved. The shop is still open.</p>
      <Link href="/shop" className="btn-ink mt-8">
        Shop the house
      </Link>
    </div>
  );
}
