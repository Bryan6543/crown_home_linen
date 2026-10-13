"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { fillTemplate, letterHtml, sendEmail } from "@/lib/mail";
import {
  deleteBanner,
  deleteCategory,
  deleteFaq,
  deleteNavItem,
  deleteProduct,
  deleteSection,
  deleteTestimonial,
  getSnapshot,
  restoreCatalog,
  recordDelivery,
  saveBanner,
  saveCampaign,
  saveCategory,
  saveFaq,
  saveNavigation,
  savePage,
  saveProduct,
  saveSection,
  saveSettings,
  saveTemplate,
  saveTestimonial,
  updateCustomerNotes,
  updateInquiry,
  updateOrder,
} from "@/lib/repo";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Banner,
  Campaign,
  Category,
  EmailTemplate,
  CmsPage,
  Faq,
  Inquiry,
  NavItem,
  Order,
  Product,
  Section,
  Settings,
  Testimonial,
} from "@/lib/types";

async function gate() {
  return requireAdmin();
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveSettingsAction(settings: Settings) {
  await gate();
  if (!settings.storeName.trim() || !settings.whatsappNumber.trim()) {
    return { error: "The house needs a name and a WhatsApp number." };
  }
  await saveSettings({ ...settings, gaMeasurementId: settings.gaMeasurementId.trim() });
  refresh();
  return { ok: true as const };
}

export async function saveProductAction(product: Product) {
  await gate();
  const title = product.title.trim();
  const slug = slugify(product.slug || title);
  if (title.length < 2 || !slug) return { error: "Add a title." };
  if (!product.categoryId) return { error: "Choose a collection." };
  if (!Number.isFinite(product.price) || product.price < 0) return { error: "Set a price." };
  const snapshot = await getSnapshot();
  const clash = snapshot.products.find((item) => item.slug === slug && item.id !== product.id);
  if (clash) return { error: "Another piece already uses that address." };
  await saveProduct({
    ...product,
    title,
    slug,
    images: product.images.filter((image) => image.url.trim()),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
    })),
  });
  refresh();
  return { ok: true as const, slug };
}

export async function deleteProductAction(id: string) {
  await gate();
  await deleteProduct(id);
  refresh();
  return { ok: true as const };
}

export async function saveCategoryAction(category: Category) {
  await gate();
  const slug = slugify(category.slug || category.name);
  if (!category.name.trim() || !slug) return { error: "Name the collection." };
  await saveCategory({ ...category, slug, name: category.name.trim() });
  refresh();
  return { ok: true as const };
}

export async function deleteCategoryAction(id: string) {
  await gate();
  await deleteCategory(id);
  refresh();
  return { ok: true as const };
}

export async function saveBannerAction(banner: Banner) {
  await gate();
  if (!banner.title.trim() || !banner.imageUrl.trim()) return { error: "A banner needs a title and an image." };
  await saveBanner(banner);
  refresh();
  return { ok: true as const };
}

export async function deleteBannerAction(id: string) {
  await gate();
  await deleteBanner(id);
  refresh();
  return { ok: true as const };
}

export async function saveSectionAction(section: Section) {
  await gate();
  await saveSection(section);
  refresh();
  return { ok: true as const };
}

export async function deleteSectionAction(id: string) {
  await gate();
  await deleteSection(id);
  refresh();
  return { ok: true as const };
}

export async function savePageAction(page: CmsPage) {
  await gate();
  const slug = slugify(page.slug);
  if (!slug) return { error: "The page needs an address." };
  await savePage({ ...page, slug });
  refresh();
  return { ok: true as const };
}

export async function saveNavigationAction(items: NavItem[]) {
  await gate();
  await saveNavigation(items.filter((item) => item.label.trim() && item.href.trim()));
  refresh();
  return { ok: true as const };
}

export async function deleteNavAction(id: string) {
  await gate();
  await deleteNavItem(id);
  refresh();
  return { ok: true as const };
}

export async function saveTestimonialAction(item: Testimonial) {
  await gate();
  if (!item.quote.trim() || !item.author.trim()) return { error: "A note needs words and a name." };
  await saveTestimonial(item);
  refresh();
  return { ok: true as const };
}

export async function deleteTestimonialAction(id: string) {
  await gate();
  await deleteTestimonial(id);
  refresh();
  return { ok: true as const };
}

export async function saveFaqAction(item: Faq) {
  await gate();
  if (!item.question.trim() || !item.answer.trim()) return { error: "Write both the question and the answer." };
  await saveFaq(item);
  refresh();
  return { ok: true as const };
}

export async function deleteFaqAction(id: string) {
  await gate();
  await deleteFaq(id);
  refresh();
  return { ok: true as const };
}

export async function updateOrderAction(id: string, patch: { status?: Order["status"]; staffNotes?: string; publicNote?: string; activity?: string; activityVisible?: boolean; notify?: boolean }) {
  const session = await gate();
  await updateOrder(id, { ...patch, author: session.email });
  let emailed = false;
  if (patch.notify && patch.status) {
    const { fillTemplate, letterHtml, sendEmail } = await import("@/lib/mail");
    const { statusLabel } = await import("@/lib/order-status");
    const snapshot = await getSnapshot();
    const order = snapshot.orders.find((item) => item.id === id);
    const template = snapshot.templates.find((item) => item.id === "order_update");
    if (order?.email && template) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const vars = {
        name: order.customerName,
        store_name: snapshot.settings.storeName,
        order_number: order.number,
        status_label: statusLabel(patch.status),
        public_note: order.publicNote || patch.publicNote || "The house book has the latest note.",
        order_url: `${origin}/orders`,
        unsubscribe_url: "",
      };
      const text = fillTemplate(template.body, vars);
      const sent = await sendEmail({
        from: process.env.EMAIL_FROM || snapshot.settings.emailFrom,
        to: order.email,
        subject: fillTemplate(template.subject, vars),
        text,
        html: letterHtml(text, snapshot.settings),
      });
      emailed = sent.ok;
    }
  }
  refresh();
  return { ok: true as const, emailed };
}

export async function updateInquiryAction(id: string, patch: { status?: Inquiry["status"]; staffNotes?: string; activity?: string }) {
  const session = await gate();
  await updateInquiry(id, { ...patch, author: session.email });
  refresh();
  return { ok: true as const };
}

export async function updateCustomerAction(id: string, notes: string) {
  await gate();
  await updateCustomerNotes(id, notes);
  refresh();
  return { ok: true as const };
}

export async function restoreCatalogAction() {
  await gate();
  await restoreCatalog();
  refresh();
  return { ok: true as const };
}

export async function uploadImageAction(formData: FormData) {
  await gate();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image." };
  if (file.size > 5_000_000) return { error: "Keep images under 5 MB." };
  if (!file.type.startsWith("image/")) return { error: "Use a PNG, JPG, or WebP." };
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const filename = `${Date.now()}-${safe}`;

  if (!isSupabaseConfigured()) {
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return { url: `/uploads/${filename}` };
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from("catalog").upload(filename, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from("catalog").getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function uploadModelAction(formData: FormData) {
  await gate();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a .glb file." };
  if (file.size > 12_000_000) return { error: "Keep the model under 12 MB." };
  if (!file.name.toLowerCase().endsWith(".glb")) return { error: "Use a .glb model." };
  const filename = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
  if (!isSupabaseConfigured()) {
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return { url: `/uploads/${filename}` };
  }
  const supabase = await createClient();
  const { error } = await supabase.storage.from("catalog").upload(filename, file, { contentType: "model/gltf-binary", upsert: false });
  if (error) return { error: error.message };
  return { url: supabase.storage.from("catalog").getPublicUrl(filename).data.publicUrl };
}

export async function saveTemplateAction(template: EmailTemplate) {
  await gate();
  if (!template.subject.trim() || !template.body.includes("{{unsubscribe_url}}") && template.id !== "order_update") {
    return { error: "A list letter needs an unsubscribe link: {{unsubscribe_url}}." };
  }
  await saveTemplate(template);
  refresh();
  return { ok: true as const };
}

export async function saveCampaignAction(campaign: Campaign) {
  await gate();
  if (!campaign.subject.trim() || !campaign.body.trim()) return { error: "A campaign needs a subject and a letter." };
  await saveCampaign(campaign);
  refresh();
  return { ok: true as const };
}

export async function sendCampaignAction(id: string) {
  await gate();
  const snapshot = await getSnapshot();
  const campaign = snapshot.campaigns.find((item) => item.id === id);
  if (!campaign) return { error: "That campaign is not in the book." };
  if (campaign.status === "sending") return { error: "This campaign is already sending." };
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const audience = snapshot.subscribers.filter((subscriber) => subscriber.status === "active" && !subscriber.email.endsWith("@example.com"));
  let sentCount = 0;
  let failedCount = 0;
  await saveCampaign({ ...campaign, status: "sending" });
  for (const subscriber of audience) {
    const already = snapshot.deliveries.some((delivery) => delivery.campaignId === id && delivery.subscriberId === subscriber.id && delivery.status === "sent");
    if (already) continue;
    const unsubscribeUrl = `${origin}/unsubscribe?token=${subscriber.token}`;
    const vars = {
      name: subscriber.name || "there",
      store_name: snapshot.settings.storeName,
      unsubscribe_url: unsubscribeUrl,
    };
    const text = fillTemplate(`${campaign.body}\n\nLeave the list:\n{{unsubscribe_url}}`, vars);
    const result = await sendEmail({
      from: process.env.EMAIL_FROM || snapshot.settings.emailFrom,
      to: subscriber.email,
      subject: fillTemplate(campaign.subject, vars),
      text,
      html: letterHtml(text, snapshot.settings),
      unsubscribeUrl,
    });
    await recordDelivery({
      id: crypto.randomUUID(),
      campaignId: id,
      subscriberId: subscriber.id,
      email: subscriber.email,
      status: result.ok ? "sent" : "failed",
      error: result.error,
      sentAt: new Date().toISOString(),
    });
    if (result.ok) sentCount += 1;
    else failedCount += 1;
  }
  await saveCampaign({
    ...campaign,
    status: sentCount > 0 ? "sent" : "draft",
    sentCount,
    failedCount,
    sentAt: sentCount > 0 ? new Date().toISOString() : null,
  });
  refresh();
  if (!process.env.RESEND_API_KEY) {
    return { error: `Nothing was delivered. Add RESEND_API_KEY and a from address, then send again. ${audience.length} active addresses were ready.` };
  }
  return { ok: true as const, sentCount, failedCount };
}
