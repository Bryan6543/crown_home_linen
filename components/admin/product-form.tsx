"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, saveProductAction, uploadImageAction } from "@/app/actions/admin";
import { formatMoney } from "@/lib/format";
import type { Category, Product, ProductOption, ProductVariant } from "@/lib/types";

function cartesian(options: ProductOption[]) {
  return options.reduce<Record<string, string>[]>(
    (rows, option) => rows.flatMap((row) => option.values.map((value) => ({ ...row, [option.name]: value }))),
    [{}],
  );
}

export function ProductForm({
  product,
  categories,
  currency,
  canDelete,
}: {
  product: Product;
  categories: Category[];
  currency: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(product);
  const [optionText, setOptionText] = useState(product.options.map((option) => option.values.join(", ")));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function parsedOptions() {
    return draft.options
      .map((option, index) => ({
        name: option.name.trim(),
        values: (optionText[index] || "").split(",").map((value) => value.trim()).filter(Boolean),
      }))
      .filter((option) => option.name && option.values.length);
  }

  function rebuild() {
    const options = parsedOptions();
    const combos = options.length ? cartesian(options) : [{}];
    const variants: ProductVariant[] = combos.map((selected) => {
      const title = Object.values(selected).join(" / ") || "Default";
      const existing = draft.variants.find((variant) => variant.title === title);
      const key = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "default";
      return (
        existing || {
          id: `${draft.id}-${key}`,
          title,
          sku: `${draft.sku || "SKU"}-${key}`.toUpperCase(),
          price: draft.price,
          compareAtPrice: draft.compareAtPrice,
          options: selected,
          available: true,
          stock: 12,
        }
      );
    });
    setDraft({ ...draft, options, variants });
  }

  async function save() {
    setPending(true);
    const options = parsedOptions();
    const result = await saveProductAction({ ...draft, options, price: Number(draft.price) || 0 });
    setPending(false);
    setMessage("error" in result ? result.error || "Could not save." : "Saved.");
    if ("ok" in result && result.slug) router.replace(`/admin/products/${draft.id}`);
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const result = await uploadImageAction(body);
    if ("error" in result) {
      setMessage(result.error || "Upload failed.");
      return;
    }
    setDraft({
      ...draft,
      images: [...draft.images, { id: crypto.randomUUID(), url: result.url, alt: draft.title, sort: draft.images.length }],
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Title
          <input className="field mt-1" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </label>
        <label className="text-sm">Address
          <input className="field mt-1" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
        </label>
        <label className="text-sm">Collection
          <select className="field mt-1" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">Status
          <select className="field mt-1" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Product["status"] })}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">Short description
          <textarea className="field mt-1 min-h-20" value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} />
        </label>
        <label className="text-sm md:col-span-2">Description
          <textarea className="field mt-1 min-h-36" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>
        <label className="text-sm">Price in cents
          <input className="field mt-1" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
          <span className="mt-1 block text-xs text-muted">{formatMoney(Number(draft.price) || 0, currency)}. 4800 means 48.00.</span>
        </label>
        <label className="text-sm">Compare-at, cents
          <input className="field mt-1" type="number" value={draft.compareAtPrice ?? ""} onChange={(event) => setDraft({ ...draft, compareAtPrice: event.target.value === "" ? null : Number(event.target.value) })} />
        </label>
        <label className="text-sm">SKU
          <input className="field mt-1" value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} />
        </label>
        <label className="text-sm">Sort
          <input className="field mt-1" type="number" value={draft.sort} onChange={(event) => setDraft({ ...draft, sort: Number(event.target.value) })} />
        </label>
        <label className="text-sm md:col-span-2">Material
          <input className="field mt-1" value={draft.material} onChange={(event) => setDraft({ ...draft, material: event.target.value })} />
        </label>
        <label className="text-sm md:col-span-2">Care
          <textarea className="field mt-1 min-h-20" value={draft.care} onChange={(event) => setDraft({ ...draft, care: event.target.value })} />
        </label>
        <label className="text-sm md:col-span-2">Measurements
          <input className="field mt-1" value={draft.dimensions} onChange={(event) => setDraft({ ...draft, dimensions: event.target.value })} />
        </label>
        <label className="text-sm">Search title
          <input className="field mt-1" value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} />
        </label>
        <label className="text-sm">Search description
          <input className="field mt-1" value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.bestseller} onChange={(event) => setDraft({ ...draft, bestseller: event.target.checked })} /> Often asked for</label>
      </div>

      <section>
        <h2 className="font-serif text-3xl">Photographs</h2>
        <div className="mt-4 space-y-3">
          {draft.images.map((image, index) => (
            <div key={image.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input className="field" value={image.url} onChange={(event) => {
                const images = draft.images.slice();
                images[index] = { ...image, url: event.target.value };
                setDraft({ ...draft, images });
              }} />
              <input className="field" value={image.alt} placeholder="Alt" onChange={(event) => {
                const images = draft.images.slice();
                images[index] = { ...image, alt: event.target.value };
                setDraft({ ...draft, images });
              }} />
              <button type="button" className="text-sm" onClick={() => setDraft({ ...draft, images: draft.images.filter((item) => item.id !== image.id) })}>Remove</button>
            </div>
          ))}
        </div>
        <label className="btn-line mt-4 cursor-pointer">
          Upload a photograph
          <input type="file" accept="image/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }} />
        </label>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Options</h2>
        <p className="mt-2 text-sm text-muted">Two groups at most. Separate values with commas, then rebuild the variants.</p>
        <div className="mt-4 space-y-3">
          {draft.options.map((option, index) => (
            <div key={`${option.name}-${index}`} className="grid gap-2 md:grid-cols-2">
              <input className="field" value={option.name} placeholder="Color" onChange={(event) => {
                const options = draft.options.slice();
                options[index] = { ...option, name: event.target.value };
                setDraft({ ...draft, options });
              }} />
              <input className="field" value={optionText[index] || ""} placeholder="Ivory, Sage" onChange={(event) => {
                const next = optionText.slice();
                next[index] = event.target.value;
                setOptionText(next);
              }} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          {draft.options.length < 2 ? (
            <button type="button" className="btn-line" onClick={() => {
              setDraft({ ...draft, options: [...draft.options, { name: "", values: [] }] });
              setOptionText([...optionText, ""]);
            }}>Add option</button>
          ) : null}
          <button type="button" className="btn-line" onClick={rebuild}>Rebuild variants</button>
        </div>
        <div className="mt-6 overflow-auto">
          <table className="admin-table">
            <thead><tr><th>Variant</th><th>Price</th><th>Stock</th><th>Available</th><th>Image</th></tr></thead>
            <tbody>
              {draft.variants.map((variant, index) => (
                <tr key={variant.id}>
                  <td>{variant.title}</td>
                  <td><input className="field" type="number" value={variant.price} onChange={(event) => {
                    const variants = draft.variants.slice();
                    variants[index] = { ...variant, price: Number(event.target.value) };
                    setDraft({ ...draft, variants });
                  }} /></td>
                  <td><input className="field" type="number" value={variant.stock} onChange={(event) => {
                    const variants = draft.variants.slice();
                    variants[index] = { ...variant, stock: Number(event.target.value) };
                    setDraft({ ...draft, variants });
                  }} /></td>
                  <td><input type="checkbox" checked={variant.available} onChange={(event) => {
                    const variants = draft.variants.slice();
                    variants[index] = { ...variant, available: event.target.checked };
                    setDraft({ ...draft, variants });
                  }} /></td>
                  <td><input className="field" value={variant.imageUrl || ""} onChange={(event) => {
                    const variants = draft.variants.slice();
                    variants[index] = { ...variant, imageUrl: event.target.value };
                    setDraft({ ...draft, variants });
                  }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {message ? <p className="text-sm">{message}</p> : null}
      <div className="flex gap-3">
        <button type="button" className="btn-ink" disabled={pending} onClick={() => void save()}>{pending ? "Saving" : "Save piece"}</button>
        {canDelete ? (
          <button type="button" className="btn-line" onClick={() => {
            if (!confirm("Remove this piece from the shop?")) return;
            void deleteProductAction(draft.id).then(() => router.push("/admin/products"));
          }}>Delete</button>
        ) : null}
      </div>
    </div>
  );
}
