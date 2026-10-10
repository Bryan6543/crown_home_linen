"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteBannerAction,
  deleteCategoryAction,
  deleteFaqAction,
  deleteNavAction,
  deleteSectionAction,
  deleteTestimonialAction,
  importSeedAction,
  saveBannerAction,
  saveCategoryAction,
  saveFaqAction,
  saveNavigationAction,
  savePageAction,
  saveSectionAction,
  saveSettingsAction,
  saveTestimonialAction,
  updateCustomerAction,
  updateInquiryAction,
  updateOrderAction,
  uploadImageAction,
} from "@/app/actions/admin";
import { blankSection } from "@/lib/defaults";
import { inquiryMessage, orderMessage, whatsappUrl } from "@/lib/format";
import type { Banner, Category, CmsPage, Faq, Inquiry, NavItem, Order, Section, Settings, Testimonial } from "@/lib/types";

function note(result: { error: string } | { ok: true }) {
  return "error" in result ? result.error : "Saved.";
}

export function SettingsForm({ settings, mode }: { settings: Settings; mode: "file" | "supabase" }) {
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState("");
  const fields: [keyof Settings, string][] = [
    ["storeName", "House name"],
    ["tagline", "Tagline"],
    ["announcement", "Announcement"],
    ["whatsappNumber", "WhatsApp number"],
    ["whatsappGreeting", "Opening WhatsApp line"],
    ["email", "Email"],
    ["phoneDisplay", "Phone as printed"],
    ["address", "Address"],
    ["city", "City"],
    ["hours", "Hours"],
    ["instagram", "Instagram URL"],
    ["currency", "Currency code"],
    ["gaMeasurementId", "Google Analytics measurement ID"],
    ["footerNote", "Footer note"],
    ["metaTitle", "Search title"],
    ["metaDescription", "Search description"],
  ];
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted">{mode === "file" ? "Edits are stored in data/store.json on this machine." : "Edits are stored in Supabase. The SQL schema must already be applied."}</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.announcementEnabled} onChange={(event) => setDraft({ ...draft, announcementEnabled: event.target.checked })} />
        Show the announcement
      </label>
      {fields.map(([key, label]) => (
        <label key={key} className="block text-sm">{label}
          {key === "footerNote" || key === "metaDescription" || key === "whatsappGreeting" ? (
            <textarea className="field mt-1 min-h-24" value={String(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
          ) : (
            <input className="field mt-1" value={String(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
          )}
        </label>
      ))}
      <p className="text-xs leading-5 text-muted">WhatsApp number is digits and a country code, with no plus. Replace 15551234567. Visits stay in this book even when the Analytics ID is empty. With an ID, the same visits are also sent to Google. Letters go out through Resend when RESEND_API_KEY is set. The from address must be a domain you have verified there.</p>
      <label className="block text-sm">From address
        <input className="field mt-1" value={draft.emailFrom || ""} onChange={(event) => setDraft({ ...draft, emailFrom: event.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.popupEnabled} onChange={(event) => setDraft({ ...draft, popupEnabled: event.target.checked })} /> Show the letter popup</label>
      <label className="block text-sm">Popup title
        <input className="field mt-1" value={draft.popupTitle || ""} onChange={(event) => setDraft({ ...draft, popupTitle: event.target.value })} />
      </label>
      <label className="block text-sm">Popup text
        <textarea className="field mt-1" value={draft.popupBody || ""} onChange={(event) => setDraft({ ...draft, popupBody: event.target.value })} />
      </label>
      <button type="button" className="btn-ink" onClick={() => void saveSettingsAction(draft).then((result) => setMessage(note(result)))}>Save settings</button>
      <button type="button" className="btn-line ml-3" onClick={() => {
        if (!confirm("Replace the book with the sample catalog, including sample orders?")) return;
        void importSeedAction().then(() => setMessage("Sample catalog loaded."));
      }}>Reload the sample catalog</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [rows, setRows] = useState(categories);
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-8">
      {rows.map((category) => (
        <div key={category.id} className="grid gap-3 border border-line bg-white p-4 md:grid-cols-2">
          <input className="field" value={category.name} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))} />
          <input className="field" value={category.slug} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, slug: event.target.value } : item))} />
          <textarea className="field md:col-span-2" value={category.description} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, description: event.target.value } : item))} />
          <input className="field" value={category.imageUrl} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, imageUrl: event.target.value } : item))} />
          <input className="field" value={category.imageAlt} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, imageAlt: event.target.value } : item))} />
          <label className="text-sm">Sort <input className="field" type="number" value={category.sort} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, sort: Number(event.target.value) } : item))} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={category.visible} onChange={(event) => setRows(rows.map((item) => item.id === category.id ? { ...item, visible: event.target.checked } : item))} /> Visible</label>
          <div className="flex gap-3 md:col-span-2">
            <button type="button" className="btn-ink" onClick={() => void saveCategoryAction(category).then((result) => setMessage(note(result)))}>Save collection</button>
            <button type="button" className="btn-line" onClick={() => void deleteCategoryAction(category.id).then(() => setRows(rows.filter((item) => item.id !== category.id)))}>Delete</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-line" onClick={() => setRows([...rows, { id: crypto.randomUUID(), name: "New collection", slug: "new-collection", description: "", imageUrl: "/images/editorial/still-life.jpg", imageAlt: "", sort: rows.length + 1, visible: true }])}>Add collection</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [rows, setRows] = useState(banners);
  const [message, setMessage] = useState("");
  function update(id: string, patch: Partial<Banner>) {
    setRows(rows.map((banner) => banner.id === id ? { ...banner, ...patch } : banner));
  }
  return (
    <div className="space-y-8">
      {rows.map((banner) => (
        <div key={banner.id} className="grid gap-3 border border-line bg-white p-4">
          <input className="field" value={banner.eyebrow} placeholder="Eyebrow" onChange={(event) => update(banner.id, { eyebrow: event.target.value })} />
          <input className="field" value={banner.title} placeholder="Title" onChange={(event) => update(banner.id, { title: event.target.value })} />
          <textarea className="field" value={banner.subtitle} onChange={(event) => update(banner.id, { subtitle: event.target.value })} />
          <input className="field" value={banner.imageUrl} onChange={(event) => update(banner.id, { imageUrl: event.target.value })} />
          <input className="field" value={banner.imageAlt} placeholder="Image description" onChange={(event) => update(banner.id, { imageAlt: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="field" value={banner.buttonLabel} onChange={(event) => update(banner.id, { buttonLabel: event.target.value })} />
            <input className="field" value={banner.buttonHref} onChange={(event) => update(banner.id, { buttonHref: event.target.value })} />
          </div>
          <label className="text-sm">Sort <input className="field" type="number" value={banner.sort} onChange={(event) => update(banner.id, { sort: Number(event.target.value) })} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={banner.active} onChange={(event) => update(banner.id, { active: event.target.checked })} /> Active</label>
          <label className="btn-line w-fit cursor-pointer">Upload
            <input type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const body = new FormData();
              body.set("file", file);
              void uploadImageAction(body).then((result) => {
                if ("url" in result) update(banner.id, { imageUrl: result.url });
                else setMessage(result.error);
              });
            }} />
          </label>
          <div className="flex gap-3">
            <button type="button" className="btn-ink" onClick={() => void saveBannerAction(banner).then((result) => setMessage(note(result)))}>Save banner</button>
            <button type="button" className="btn-line" onClick={() => void deleteBannerAction(banner.id).then(() => setRows(rows.filter((item) => item.id !== banner.id)))}>Delete</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-line" onClick={() => setRows([...rows, { id: crypto.randomUUID(), placement: "hero", eyebrow: "", title: "New banner", subtitle: "", imageUrl: "/images/heroes/bed.jpg", imageAlt: "", buttonLabel: "Shop", buttonHref: "/shop", align: "left", tone: "light", active: true, sort: rows.length + 1 }])}>Add banner</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function NavManager({ items }: { items: NavItem[] }) {
  const [rows, setRows] = useState(items);
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-4">
      {rows.map((item) => (
        <div key={item.id} className="grid gap-2 border border-line bg-white p-3 md:grid-cols-5">
          <input className="field" value={item.label} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, label: event.target.value } : row))} />
          <input className="field" value={item.href} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, href: event.target.value } : row))} />
          <select className="field" value={item.location} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, location: event.target.value as NavItem["location"] } : row))}>
            <option value="header">Header</option>
            <option value="footer_shop">Footer shop</option>
            <option value="footer_help">Footer help</option>
            <option value="footer_company">Footer house</option>
          </select>
          <input className="field" type="number" value={item.sort} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, sort: Number(event.target.value) } : row))} />
          <div className="flex items-center gap-3">
            <label className="text-sm"><input type="checkbox" checked={item.visible} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, visible: event.target.checked } : row))} /> Show</label>
            <button type="button" onClick={() => void deleteNavAction(item.id).then(() => setRows(rows.filter((row) => row.id !== item.id)))}>Delete</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-line" onClick={() => setRows([...rows, { id: crypto.randomUUID(), label: "New link", href: "/", location: "header", sort: rows.length + 1, visible: true }])}>Add link</button>
      <button type="button" className="btn-ink ml-3" onClick={() => void saveNavigationAction(rows).then((result) => setMessage(note(result)))}>Save navigation</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function QuoteManager({ items }: { items: Testimonial[] }) {
  const [rows, setRows] = useState(items);
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-6">
      {rows.map((item) => (
        <div key={item.id} className="space-y-2 border border-line bg-white p-4">
          <textarea className="field" value={item.quote} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, quote: event.target.value } : row))} />
          <input className="field" value={item.author} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, author: event.target.value } : row))} />
          <input className="field" value={item.detail} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, detail: event.target.value } : row))} />
          <button type="button" className="btn-ink" onClick={() => void saveTestimonialAction(item).then((result) => setMessage(note(result)))}>Save note</button>
          <button type="button" className="btn-line ml-3" onClick={() => void deleteTestimonialAction(item.id)}>Delete</button>
        </div>
      ))}
      <button type="button" className="btn-line" onClick={() => setRows([...rows, { id: crypto.randomUUID(), quote: "", author: "", detail: "", rating: 5, visible: true, sort: rows.length + 1 }])}>Add note</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function FaqManager({ items }: { items: Faq[] }) {
  const [rows, setRows] = useState(items);
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-6">
      {rows.map((item) => (
        <div key={item.id} className="space-y-2 border border-line bg-white p-4">
          <input className="field" value={item.question} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, question: event.target.value } : row))} />
          <textarea className="field min-h-24" value={item.answer} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, answer: event.target.value } : row))} />
          <label className="text-sm"><input type="checkbox" checked={item.visible} onChange={(event) => setRows(rows.map((row) => row.id === item.id ? { ...row, visible: event.target.checked } : row))} /> Visible</label>
          <div>
            <button type="button" className="btn-ink" onClick={() => void saveFaqAction(item).then((result) => setMessage(note(result)))}>Save question</button>
            <button type="button" className="btn-line ml-3" onClick={() => void deleteFaqAction(item.id)}>Delete</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-line" onClick={() => setRows([...rows, { id: crypto.randomUUID(), question: "", answer: "", visible: true, sort: rows.length + 1 }])}>Add question</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function PageCreator() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form className="mt-8 grid gap-3 border border-line bg-white p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => {
      event.preventDefault();
      const page: CmsPage = { slug, title, seoTitle: title, seoDescription: "", published: true, kind: "page" };
      void savePageAction(page).then((result) => {
        if ("error" in result) setMessage(result.error || "Could not create the page.");
        else router.push(`/admin/pages/${slug}`);
      });
    }}>
      <input className="field" placeholder="Address, such as trade" value={slug} onChange={(event) => setSlug(event.target.value)} />
      <input className="field" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <button className="btn-ink" type="submit">Create page</button>
      {message ? <p className="text-sm md:col-span-3">{message}</p> : null}
    </form>
  );
}

export function PageMetaForm({ page }: { page: CmsPage }) {
  const [draft, setDraft] = useState(page);
  const [message, setMessage] = useState("");
  return (
    <div className="grid gap-3 border border-line bg-white p-4">
      <input className="field" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      <input className="field" value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} />
      <textarea className="field" value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} />
      <label className="text-sm"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /> Published</label>
      <button type="button" className="btn-ink w-fit" onClick={() => void savePageAction(draft).then((result) => setMessage(note(result)))}>Save page</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function SectionManager({ pageSlug, sections }: { pageSlug: string; sections: Section[] }) {
  const [rows, setRows] = useState(sections);
  const [type, setType] = useState<Section["type"]>("rich_text");
  const [message, setMessage] = useState("");

  function update(id: string, patch: Record<string, unknown>) {
    setRows(rows.map((section) => section.id === id ? { ...section, ...patch } as Section : section));
  }

  return (
    <div className="mt-8 space-y-6">
      {rows.map((section, index) => (
        <article key={section.id} className="space-y-3 border border-line bg-white p-4">
          <p className="eyebrow">{section.type}</p>
          {section.type !== "hero" && "title" in section ? (
            <input className="field" value={section.title} onChange={(event) => update(section.id, { title: event.target.value })} />
          ) : <p className="text-sm text-muted">This block uses the hero banners.</p>}
          {"subtitle" in section ? <textarea className="field" value={section.subtitle} onChange={(event) => update(section.id, { subtitle: event.target.value })} /> : null}
          {"body" in section ? <textarea className="field min-h-28" value={section.body} onChange={(event) => update(section.id, { body: event.target.value })} /> : null}
          {"eyebrow" in section ? <input className="field" value={section.eyebrow} onChange={(event) => update(section.id, { eyebrow: event.target.value })} /> : null}
          {"imageUrl" in section ? <input className="field" value={section.imageUrl} onChange={(event) => update(section.id, { imageUrl: event.target.value })} /> : null}
          {"imageAlt" in section ? <input className="field" value={section.imageAlt} onChange={(event) => update(section.id, { imageAlt: event.target.value })} /> : null}
          {"buttonLabel" in section ? <input className="field" value={section.buttonLabel} onChange={(event) => update(section.id, { buttonLabel: event.target.value })} /> : null}
          {"buttonHref" in section ? <input className="field" value={section.buttonHref} onChange={(event) => update(section.id, { buttonHref: event.target.value })} /> : null}
          {section.type === "product_grid" ? (
            <div className="grid gap-2 md:grid-cols-2">
              <select className="field" value={section.source} onChange={(event) => update(section.id, { source: event.target.value })}>
                <option value="featured">Featured</option>
                <option value="bestsellers">Often asked for</option>
                <option value="new">Newest</option>
              </select>
              <input className="field" type="number" value={section.limit} onChange={(event) => update(section.id, { limit: Number(event.target.value) })} />
            </div>
          ) : null}
          {section.type === "image_text" ? (
            <select className="field" value={section.align} onChange={(event) => update(section.id, { align: event.target.value })}>
              <option value="left">Image left</option>
              <option value="right">Image right</option>
            </select>
          ) : null}
          {section.type === "values" ? (
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={`${item.title}-${itemIndex}`} className="grid gap-2 md:grid-cols-2">
                  <input className="field" value={item.title} onChange={(event) => {
                    const items = section.items.slice();
                    items[itemIndex] = { ...item, title: event.target.value };
                    update(section.id, { items });
                  }} />
                  <input className="field" value={item.text} onChange={(event) => {
                    const items = section.items.slice();
                    items[itemIndex] = { ...item, text: event.target.value };
                    update(section.id, { items });
                  }} />
                </div>
              ))}
              <button type="button" className="text-sm" onClick={() => update(section.id, { items: [...section.items, { title: "New line", text: "" }] })}>Add a line</button>
            </div>
          ) : null}
          {section.type === "gallery" ? (
            <div className="space-y-2">
              {section.images.map((image, imageIndex) => (
                <div key={`${image.url}-${imageIndex}`} className="grid gap-2 md:grid-cols-2">
                  <input className="field" value={image.url} onChange={(event) => {
                    const images = section.images.slice();
                    images[imageIndex] = { ...image, url: event.target.value };
                    update(section.id, { images });
                  }} />
                  <input className="field" value={image.alt} onChange={(event) => {
                    const images = section.images.slice();
                    images[imageIndex] = { ...image, alt: event.target.value };
                    update(section.id, { images });
                  }} />
                </div>
              ))}
              <button type="button" className="text-sm" onClick={() => update(section.id, { images: [...section.images, { url: "", alt: "" }] })}>Add an image</button>
            </div>
          ) : null}
          <label className="text-sm"><input type="checkbox" checked={section.visible} onChange={(event) => update(section.id, { visible: event.target.checked })} /> Visible</label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-ink" onClick={() => void saveSectionAction(section).then((result) => setMessage(note(result)))}>Save section</button>
            <button type="button" className="btn-line" onClick={() => {
              if (index === 0) return;
              const copy = rows.slice();
              const previous = copy[index - 1];
              const current = copy[index];
              const previousSort = previous.sort;
              copy[index - 1] = { ...current, sort: previousSort };
              copy[index] = { ...previous, sort: current.sort };
              setRows(copy);
              void saveSectionAction(copy[index - 1]);
              void saveSectionAction(copy[index]);
            }}>Move up</button>
            <button type="button" className="btn-line" onClick={() => void deleteSectionAction(section.id).then(() => setRows(rows.filter((item) => item.id !== section.id)))}>Delete</button>
          </div>
        </article>
      ))}
      <div className="flex gap-3">
        <select className="field" value={type} onChange={(event) => setType(event.target.value as Section["type"])}>
          {["hero", "product_grid", "image_text", "categories", "values", "testimonials", "newsletter", "rich_text", "faq", "promo", "contact", "gallery"].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="button" className="btn-line" onClick={() => {
          const section = blankSection(type, pageSlug, rows.length + 1);
          setRows([...rows, section]);
          void saveSectionAction(section).then((result) => setMessage(note(result)));
        }}>Add section</button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function OrderDesk({ order, currency, whatsappNumber, storeName }: { order: Order; currency: string; whatsappNumber: string; storeName: string }) {
  const [status, setStatus] = useState(order.status);
  const [staffNotes, setStaffNotes] = useState(order.staffNotes);
  const [publicNote, setPublicNote] = useState(order.publicNote || "");
  const [activity, setActivity] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [notify, setNotify] = useState(Boolean(order.email));
  const [message, setMessage] = useState("");
  const link = whatsappUrl(whatsappNumber, orderMessage(order, { storeName, currency }));
  return (
    <div className="max-w-3xl space-y-4">
      <a className="btn-ink" href={link} target="_blank" rel="noreferrer">Open WhatsApp</a>
      <label className="block text-sm">Status
        <select className="field mt-1" value={status} onChange={(event) => setStatus(event.target.value as Order["status"])}>
          {["new", "accepted", "confirmed", "packed", "shipped", "fulfilled", "cancelled"].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="block text-sm">Note the customer can see
        <textarea className="field mt-1 min-h-24" value={publicNote} onChange={(event) => setPublicNote(event.target.value)} />
      </label>
      <label className="block text-sm">Staff notes, private
        <textarea className="field mt-1 min-h-24" value={staffNotes} onChange={(event) => setStaffNotes(event.target.value)} />
      </label>
      <label className="block text-sm">Note to the book
        <input className="field mt-1" value={activity} onChange={(event) => setActivity(event.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showNote} onChange={(event) => setShowNote(event.target.checked)} /> Show that note on the customer's order page</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} /> Email the customer about this status</label>
      <button type="button" className="btn-ink" onClick={() => void updateOrderAction(order.id, { status, staffNotes, publicNote, activity, activityVisible: showNote, notify }).then((result) => {
        if ("error" in result && typeof result.error === "string") setMessage(result.error);
        else if ("emailed" in result && result.emailed) setMessage("Saved, and the letter was sent.");
        else setMessage("Saved. The customer can see this on Your orders.");
      })}>Save order</button>
      {message ? <p className="text-sm">{message}</p> : null}
      <ul className="space-y-2 text-sm text-muted">
        {order.activities.map((item) => <li key={item.id}>{item.at} — {item.author}: {item.message}</li>)}
      </ul>
    </div>
  );
}

export function InquiryDesk({ inquiry, whatsappNumber, storeName }: { inquiry: Inquiry; whatsappNumber: string; storeName: string }) {
  const [status, setStatus] = useState(inquiry.status);
  const [staffNotes, setStaffNotes] = useState(inquiry.staffNotes);
  const [activity, setActivity] = useState("");
  const [message, setMessage] = useState("");
  const link = whatsappUrl(whatsappNumber, inquiryMessage({ storeName, name: inquiry.name, phone: inquiry.phone, email: inquiry.email, message: inquiry.message, productTitle: inquiry.productTitle }));
  return (
    <div className="max-w-3xl space-y-4">
      <a className="btn-ink" href={link} target="_blank" rel="noreferrer">Open WhatsApp</a>
      <label className="block text-sm">Status
        <select className="field mt-1" value={status} onChange={(event) => setStatus(event.target.value as Inquiry["status"])}>
          {["new", "in_progress", "resolved"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="block text-sm">Staff notes
        <textarea className="field mt-1 min-h-24" value={staffNotes} onChange={(event) => setStaffNotes(event.target.value)} />
      </label>
      <input className="field" placeholder="Note to the book" value={activity} onChange={(event) => setActivity(event.target.value)} />
      <button type="button" className="btn-ink" onClick={() => void updateInquiryAction(inquiry.id, { status, staffNotes, activity }).then((result) => setMessage(note(result)))}>Save inquiry</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function CustomerNotes({ id, notes }: { id: string; notes: string }) {
  const [value, setValue] = useState(notes);
  const [message, setMessage] = useState("");
  return (
    <div className="flex gap-2">
      <input className="field" value={value} onChange={(event) => setValue(event.target.value)} />
      <button type="button" className="btn-line" onClick={() => void updateCustomerAction(id, value).then((result) => setMessage(note(result)))}>Save</button>
      {message ? <span className="text-xs">{message}</span> : null}
    </div>
  );
}
