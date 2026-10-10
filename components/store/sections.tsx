import Image from "next/image";
import Link from "next/link";
import { displayPrice, heroBanners, pageSections, visibleCategories } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import type { Product, Section, StoreSnapshot } from "@/lib/types";
import { HeroCarousel, Reveal } from "@/components/store/motion";
import { InquiryForm } from "@/components/store/forms";
import { SubscribeForm } from "@/components/store/subscribe-form";

export function ProductCard({ product, currency }: { product: Product; currency: string }) {
  const price = displayPrice(product);
  const secondary = product.images[1]?.url;
  return (
    <Link href={`/products/${product.slug}`} className="group block" data-track={product.title} data-track-id={`card-${product.slug}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        {product.images[0] ? (
          <Image src={product.images[0].url} alt={product.images[0].alt || product.title} fill className="object-cover transition duration-700 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, 50vw" />
        ) : null}
        {secondary ? (
          <Image src={secondary} alt="" fill className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" sizes="(min-width: 1024px) 25vw, 50vw" />
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px]">{product.title}</h3>
        <p className="text-sm text-muted">
          {price.compare ? <span className="mr-2 line-through">{formatMoney(price.compare, currency)}</span> : null}
          {formatMoney(price.price, currency)}
        </p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{product.material.split(",")[0]}</p>
    </Link>
  );
}

function pickProducts(snapshot: StoreSnapshot, source: "featured" | "bestsellers" | "new", limit: number) {
  const active = snapshot.products.filter((product) => product.status === "active");
  const list =
    source === "featured"
      ? active.filter((product) => product.featured)
      : source === "bestsellers"
        ? active.filter((product) => product.bestseller)
        : [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list.slice(0, limit);
}

function paragraphs(body: string) {
  return body.split(/\n\n+/).filter(Boolean);
}

export function PageSections({ snapshot, slug }: { snapshot: StoreSnapshot; slug: string }) {
  const sections = pageSections(snapshot, slug);
  return (
    <>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} snapshot={snapshot} />
      ))}
    </>
  );
}

function SectionBlock({ section, snapshot }: { section: Section; snapshot: StoreSnapshot }) {
  const currency = snapshot.settings.currency;
  if (section.type === "hero") return <HeroCarousel banners={heroBanners(snapshot)} />;

  if (section.type === "categories") {
    const categories = visibleCategories(snapshot);
    return (
      <Reveal className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <p className="eyebrow">Collections</p>
        <h2 className="mt-2 font-serif text-4xl md:text-5xl">{section.title}</h2>
        {section.subtitle ? <p className="mt-3 max-w-xl text-muted">{section.subtitle}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/collections/${category.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-sand" data-track={category.name} data-track-id={`collection-${category.slug}`}>
              <Image src={category.imageUrl} alt={category.imageAlt || category.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="25vw" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 font-serif text-3xl text-white">{category.name}</span>
            </Link>
          ))}
        </div>
      </Reveal>
    );
  }

  if (section.type === "product_grid") {
    const products = pickProducts(snapshot, section.source, section.limit);
    return (
      <Reveal className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl">{section.title}</h2>
            {section.subtitle ? <p className="mt-3 text-muted">{section.subtitle}</p> : null}
          </div>
          <Link href="/shop" className="hidden text-xs uppercase tracking-[0.16em] md:inline" data-track="Shop all" data-track-id="shop-all">
            Shop all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} currency={currency} />
          ))}
        </div>
      </Reveal>
    );
  }

  if (section.type === "image_text") {
    const copy = (
      <div className="flex flex-col justify-center">
        {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">{section.title}</h2>
        <div className="prose-house mt-5 max-w-md text-sm leading-7 text-muted">
          {paragraphs(section.body).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        {section.buttonLabel ? (
          <Link href={section.buttonHref || "/shop"} className="btn-line mt-8 w-fit" data-track={section.buttonLabel} data-track-id={`story-${section.id}`}>
            {section.buttonLabel}
          </Link>
        ) : null}
      </div>
    );
    const picture = (
      <div className="relative min-h-[420px] bg-sand">
        <Image src={section.imageUrl} alt={section.imageAlt || section.title} fill className="object-cover" sizes="50vw" />
      </div>
    );
    return (
      <Reveal className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
        {section.align === "left" ? picture : copy}
        {section.align === "left" ? copy : picture}
      </Reveal>
    );
  }

  if (section.type === "values") {
    return (
      <Reveal className="bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="font-serif text-4xl">{section.title}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {section.items.map((item) => (
              <div key={item.title}>
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    );
  }

  if (section.type === "testimonials") {
    const quotes = snapshot.testimonials.filter((item) => item.visible).sort((a, b) => a.sort - b.sort);
    return (
      <Reveal className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <h2 className="font-serif text-4xl">{section.title}</h2>
        {section.subtitle ? <p className="mt-3 text-muted">{section.subtitle}</p> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {quotes.map((quote) => (
            <blockquote key={quote.id} className="border border-line bg-white p-6">
              <p className="font-serif text-2xl leading-snug">“{quote.quote}”</p>
              <footer className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">
                {quote.author} · {quote.detail}
              </footer>
            </blockquote>
          ))}
        </div>
      </Reveal>
    );
  }

  if (section.type === "promo") {
    return (
      <Reveal className="relative mx-auto my-8 min-h-[420px] max-w-6xl overflow-hidden bg-ink">
        <Image src={section.imageUrl} alt={section.imageAlt || section.title} fill className="object-cover opacity-70" sizes="100vw" />
        <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-8 text-white md:p-14">
          <p className="eyebrow text-brass-soft">{section.eyebrow}</p>
          <h2 className="mt-3 max-w-lg font-serif text-5xl">{section.title}</h2>
          {section.body ? <p className="mt-3 max-w-md text-white/85">{section.body}</p> : null}
          <Link href={section.buttonHref} className="btn-ink mt-6 w-fit bg-paper text-ink" data-track={section.buttonLabel} data-track-id={`promo-${section.id}`}>
            {section.buttonLabel}
          </Link>
        </div>
      </Reveal>
    );
  }

  if (section.type === "gallery") {
    return (
      <Reveal className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <h2 className="font-serif text-4xl">{section.title}</h2>
        {section.subtitle ? <p className="mt-3 text-muted">{section.subtitle}</p> : null}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {section.images.map((image) => (
            <div key={image.url} className="relative aspect-[3/4] bg-sand">
              <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      </Reveal>
    );
  }

  if (section.type === "newsletter") {
    return (
      <Reveal className="bg-ink py-16 text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl">{section.title}</h2>
            <p className="mt-4 max-w-md text-white/75">{section.subtitle}</p>
          </div>
          <SubscribeForm source="home" buttonLabel={section.buttonLabel} dark />
        </div>
      </Reveal>
    );
  }

  if (section.type === "faq") {
    const faqs = snapshot.faqs.filter((faq) => faq.visible).sort((a, b) => a.sort - b.sort);
    return (
      <Reveal className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        <h2 className="font-serif text-5xl">{section.title}</h2>
        {section.subtitle ? <p className="mt-3 text-muted">{section.subtitle}</p> : null}
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map((faq) => (
            <details key={faq.id} className="group py-4">
              <summary className="cursor-pointer list-none font-serif text-2xl">{faq.question}</summary>
              <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Reveal>
    );
  }

  if (section.type === "contact") {
    return (
      <Reveal className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl">{section.title}</h1>
          <p className="mt-4 max-w-md text-muted">{section.subtitle}</p>
          <dl className="mt-8 space-y-3 text-sm">
            <div>
              <dt className="eyebrow">Visit</dt>
              <dd className="mt-1">
                {snapshot.settings.address}, {snapshot.settings.city}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Write</dt>
              <dd className="mt-1">{snapshot.settings.email}</dd>
            </div>
            <div>
              <dt className="eyebrow">Call</dt>
              <dd className="mt-1">{snapshot.settings.phoneDisplay}</dd>
            </div>
            <div>
              <dt className="eyebrow">Hours</dt>
              <dd className="mt-1">{snapshot.settings.hours}</dd>
            </div>
          </dl>
        </div>
        <InquiryForm type="contact" buttonLabel="Send on WhatsApp" pagePath="/contact" />
      </Reveal>
    );
  }

  return (
    <Reveal className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="font-serif text-5xl md:text-6xl">{section.title}</h1>
      <div className="prose-house mt-6 text-base leading-8 text-ink/80">
        {paragraphs(section.body).map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </Reveal>
  );
}
