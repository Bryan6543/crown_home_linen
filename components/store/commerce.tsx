"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { displayPrice, variantInStock } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/store/cart";
import { InquiryForm } from "@/components/store/forms";
import { ProductCard } from "@/components/store/sections";

export function ProductPurchase({ product, currency }: { product: Product; currency: string }) {
  const cart = useCart();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((option) => [option.name, option.values[0] || ""])),
  );
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [ask, setAsk] = useState(false);

  const variant = product.variants.find((item) =>
    Object.entries(selected).every(([name, value]) => item.options[name] === value),
  );
  const price = displayPrice(product, variant);
  const images = product.images;
  const activeImage = variant?.imageUrl
    ? images.find((image) => image.url === variant.imageUrl) || { url: variant.imageUrl, alt: product.title }
    : images[imageIndex] || images[0];

  function choose(name: string, value: string) {
    const next = { ...selected, [name]: value };
    setSelected(next);
    const match = product.variants.find((item) => Object.entries(next).every(([key, optionValue]) => item.options[key] === optionValue));
    if (match?.imageUrl) {
      const index = images.findIndex((image) => image.url === match.imageUrl);
      if (index >= 0) setImageIndex(index);
    }
  }

  function add(openBag = true) {
    if (!variant || !variantInStock(variant)) return;
    cart.add(
      {
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        slug: product.slug,
        imageUrl: activeImage?.url || "",
        unitPrice: variant.price,
      },
      quantity,
    );
    if (!openBag) cart.setOpen(false);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[3/4] bg-sand">
          {activeImage ? <Image src={activeImage.url} alt={activeImage.alt || product.title} fill className="object-cover" priority sizes="(min-width: 1024px) 50vw, 100vw" /> : null}
        </div>
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button key={image.id} type="button" className={`relative h-20 w-16 bg-sand ${index === imageIndex ? "ring-1 ring-ink" : ""}`} onClick={() => setImageIndex(index)}>
              <Image src={image.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow">Crown</p>
        <span className="crown-rule mt-3" aria-hidden />
        <h1 className="mt-2 gold-text font-serif text-5xl font-bold leading-tight">{product.title}</h1>
        <p className="mt-4 font-serif text-2xl font-bold text-brass">
          {price.compare ? <span className="mr-3 font-normal text-muted line-through">{formatMoney(price.compare, currency)}</span> : null}
          {formatMoney(price.price, currency)}
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted">{product.shortDescription}</p>
        <div className="mt-8 space-y-5">
          {product.options.map((option) => (
            <div key={option.name}>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">{option.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const on = selected[option.name] === value;
                  return (
                    <button key={value} type="button" onClick={() => choose(option.name, value)} className={`min-h-10 border px-4 text-sm ${on ? "border-navy bg-navy text-paper shadow-[inset_0_-2px_0_var(--color-gold)]" : "border-line"}`}>
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-line">
            <button type="button" className="grid h-12 w-12 place-items-center" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
              <Minus size={14} />
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button type="button" className="grid h-12 w-12 place-items-center" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>
              <Plus size={14} />
            </button>
          </div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{variant && variantInStock(variant) ? `${variant.stock} in the cupboard` : "Unavailable"}</p>
        </div>
        <div className="mt-6 grid gap-3">
          <button type="button" disabled={!variant || !variantInStock(variant)} onClick={() => add(true)} data-track="Add to bag" data-track-id="add-to-bag" data-track-type="add_to_cart" className="btn-line w-full disabled:opacity-40">
            Add to bag
          </button>
          <Link href="/cart" onClick={() => add(false)} data-track="Order on WhatsApp" data-track-id="order-whatsapp" data-track-type="whatsapp_click" className="btn-ink w-full">
            Order on WhatsApp
          </Link>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">The order is written into the house book, then WhatsApp opens with the details. We confirm the total before anything is paid.</p>
        <div className="mt-8 divide-y divide-line border-y border-line text-sm">
          {[
            ["The cloth", product.description],
            ["Material", product.material],
            ["Care", product.care],
            ["Measure", product.dimensions],
          ].map(([title, body]) => (
            <details key={title} className="py-4" open={title === "The cloth"}>
              <summary className="cursor-pointer uppercase tracking-[0.14em] text-xs">{title}</summary>
              <div className="mt-3 space-y-3 leading-7 text-muted">
                {body.split(/\n\n+/).map((paragraph) => (
                  <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
        <button type="button" className="mt-6 text-xs uppercase tracking-[0.16em]" onClick={() => setAsk((value) => !value)} data-track="Ask about this piece" data-track-id="ask-product">
          Ask about this piece
        </button>
        {ask ? (
          <div className="mt-4">
            <InquiryForm type="product" buttonLabel="Ask on WhatsApp" pagePath={`/products/${product.slug}`} productTitle={product.title} productSlug={product.slug} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ShopBrowser({
  products,
  currency,
  categories,
  initialCategory = "",
  heading,
  intro,
}: {
  products: Product[];
  currency: string;
  categories: { id: string; name: string }[];
  initialCategory?: string;
  heading: string;
  intro?: string;
}) {
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState(initialCategory);
  const visible = useMemo(() => {
    const filtered = category ? products.filter((product) => product.categoryId === category) : products;
    const copy = [...filtered];
    if (sort === "price-asc") copy.sort((a, b) => displayPrice(a).price - displayPrice(b).price);
    if (sort === "price-desc") copy.sort((a, b) => displayPrice(b).price - displayPrice(a).price);
    if (sort === "new") copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return copy;
  }, [category, products, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <h1 className="gold-text font-serif text-5xl font-bold md:text-6xl">{heading}</h1>
      {intro ? <p className="mt-4 max-w-2xl text-muted">{intro}</p> : null}
      <div className="mt-8 flex flex-col gap-3 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`px-3 py-2 text-xs uppercase tracking-[0.14em] ${category === "" ? "bg-ink text-paper" : ""}`} onClick={() => setCategory("")}>
            All
          </button>
          {categories.map((item) => (
            <button key={item.id} type="button" className={`px-3 py-2 text-xs uppercase tracking-[0.14em] ${category === item.id ? "bg-ink text-paper" : ""}`} onClick={() => setCategory(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <label className="text-xs uppercase tracking-[0.14em] text-muted">
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="ml-2 border border-line bg-paper px-2 py-2 text-ink">
            <option value="featured">Featured</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">{visible.length} pieces</p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} currency={currency} />
        ))}
      </div>
    </div>
  );
}
