export default async function UnsubscribedPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  const copy =
    result === "ok"
      ? "You have left the list. Orders already placed are unchanged."
      : result === "already"
        ? "This address was already off the list."
        : "That link is not on the list.";
  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <h1 className="font-serif text-5xl">The list</h1>
      <p className="mt-4 leading-7">{copy}</p>
    </div>
  );
}
