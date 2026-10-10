import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { connection } from "next/server";
import { blankActivity, migrateSnapshot } from "@/lib/migrate";
import { statusLabel } from "@/lib/order-status";
import { createSeed } from "@/lib/seed";
import { digitsOnly } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsEvent,
  Banner,
  Category,
  CmsPage,
  Customer,
  Faq,
  Inquiry,
  NavItem,
  Order,
  Product,
  Section,
  Settings,
  StoreSnapshot,
  Subscriber,
  Testimonial,
  Campaign,
  Delivery,
  EmailTemplate,
} from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "store.json");
let queue: Promise<unknown> = Promise.resolve();

function locked<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileStore(): Promise<StoreSnapshot> {
  try {
    const raw = await readFile(filePath, "utf8");
    return migrateSnapshot(JSON.parse(raw) as StoreSnapshot);
  } catch {
    const seed = createSeed();
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeFileStore(snapshot: StoreSnapshot) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8");
}

function touchCustomer(snapshot: StoreSnapshot, input: { name: string; phone: string; email: string }, kind: "order" | "inquiry") {
  const id = digitsOnly(input.phone);
  if (!id) return;
  const now = new Date().toISOString();
  const existing = snapshot.customers.find((customer) => customer.id === id);
  if (!existing) {
    snapshot.customers.unshift({
      id,
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes: "",
      orderCount: kind === "order" ? 1 : 0,
      inquiryCount: kind === "inquiry" ? 1 : 0,
      createdAt: now,
      lastSeenAt: now,
    });
    return;
  }
  existing.name = input.name || existing.name;
  existing.email = input.email || existing.email;
  existing.phone = input.phone || existing.phone;
  existing.lastSeenAt = now;
  if (kind === "order") existing.orderCount += 1;
  else existing.inquiryCount += 1;
}

async function docs<T>(table: string): Promise<T[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select("doc");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.doc as T);
}

async function upsertDoc(table: string, row: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).upsert(row);
  if (error) throw new Error(error.message);
}

async function insertDoc(table: string, row: Record<string, unknown> | Record<string, unknown>[]) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert(row);
  if (error) throw new Error(error.message);
}

async function docsOrEmpty<T>(table: string): Promise<T[]> {
  try {
    return await docs<T>(table);
  } catch {
    return [];
  }
}

async function deleteRow(table: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function nextNumber(orders: Order[]) {
  const max = orders.reduce((highest, order) => {
    const value = Number(order.number.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 1000);
  return `CHL-${max + 1}`;
}

export async function getSnapshot(): Promise<StoreSnapshot> {
  await connection();
  if (!isSupabaseConfigured()) return readFileStore();
  const [settingsRows, categories, products, banners, pages, sections, testimonials, faqs, navigation, orders, inquiries, customers, events, subscribers, campaigns, deliveries, templates] =
    await Promise.all([
      docs<Settings>("settings"),
      docs<Category>("categories"),
      docs<Product>("products"),
      docs<Banner>("banners"),
      docs<CmsPage>("pages"),
      docs<Section>("sections"),
      docs<Testimonial>("testimonials"),
      docs<Faq>("faqs"),
      docs<NavItem>("navigation"),
      docs<Order>("orders"),
      docs<Inquiry>("inquiries"),
      docs<Customer>("customers"),
      docs<AnalyticsEvent>("analytics_events"),
      docsOrEmpty<Subscriber>("subscribers"),
      docsOrEmpty<Campaign>("campaigns"),
      docsOrEmpty<Delivery>("deliveries"),
      docsOrEmpty<EmailTemplate>("templates"),
    ]);
  const seed = createSeed();
  return migrateSnapshot({
    settings: settingsRows[0] || seed.settings,
    categories,
    products,
    banners,
    pages,
    sections,
    testimonials,
    faqs,
    navigation,
    orders,
    inquiries,
    customers,
    events,
    subscribers,
    campaigns,
    deliveries,
    templates,
  });
}

export async function saveSettings(settings: Settings) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.settings = settings;
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("settings", { id: "1", doc: settings });
}

export async function saveProduct(product: Product) {
  const next = { ...product, updatedAt: new Date().toISOString() };
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.products.findIndex((item) => item.id === next.id);
      if (index >= 0) snapshot.products[index] = next;
      else snapshot.products.push(next);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("products", {
    id: next.id,
    slug: next.slug,
    status: next.status,
    category_id: next.categoryId,
    doc: next,
  });
}

export async function deleteProduct(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.products = snapshot.products.filter((product) => product.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("products", id);
}

export async function saveCategory(category: Category) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.categories.findIndex((item) => item.id === category.id);
      if (index >= 0) snapshot.categories[index] = category;
      else snapshot.categories.push(category);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("categories", { id: category.id, slug: category.slug, visible: category.visible, sort: category.sort, doc: category });
}

export async function deleteCategory(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.categories = snapshot.categories.filter((category) => category.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("categories", id);
}

export async function saveBanner(banner: Banner) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.banners.findIndex((item) => item.id === banner.id);
      if (index >= 0) snapshot.banners[index] = banner;
      else snapshot.banners.push(banner);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("banners", { id: banner.id, active: banner.active, sort: banner.sort, doc: banner });
}

export async function deleteBanner(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.banners = snapshot.banners.filter((banner) => banner.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("banners", id);
}

export async function saveSection(section: Section) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.sections.findIndex((item) => item.id === section.id);
      if (index >= 0) snapshot.sections[index] = section;
      else snapshot.sections.push(section);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("sections", { id: section.id, page_slug: section.pageSlug, sort: section.sort, doc: section });
}

export async function deleteSection(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.sections = snapshot.sections.filter((section) => section.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("sections", id);
}

export async function savePage(page: CmsPage) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.pages.findIndex((item) => item.slug === page.slug);
      if (index >= 0) snapshot.pages[index] = page;
      else snapshot.pages.push(page);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("pages", { id: page.slug, slug: page.slug, published: page.published, doc: page });
}

export async function saveNavigation(items: NavItem[]) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.navigation = items;
      await writeFileStore(snapshot);
    });
    return;
  }
  for (const item of items) {
    await upsertDoc("navigation", { id: item.id, sort: item.sort, doc: item });
  }
}

export async function deleteNavItem(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.navigation = snapshot.navigation.filter((item) => item.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("navigation", id);
}

export async function saveTestimonial(item: Testimonial) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.testimonials.findIndex((row) => row.id === item.id);
      if (index >= 0) snapshot.testimonials[index] = item;
      else snapshot.testimonials.push(item);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("testimonials", { id: item.id, sort: item.sort, doc: item });
}

export async function deleteTestimonial(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.testimonials = snapshot.testimonials.filter((item) => item.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("testimonials", id);
}

export async function saveFaq(item: Faq) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.faqs.findIndex((row) => row.id === item.id);
      if (index >= 0) snapshot.faqs[index] = item;
      else snapshot.faqs.push(item);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("faqs", { id: item.id, sort: item.sort, doc: item });
}

export async function deleteFaq(id: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.faqs = snapshot.faqs.filter((item) => item.id !== id);
      await writeFileStore(snapshot);
    });
    return;
  }
  await deleteRow("faqs", id);
}

export async function createOrder(input: Omit<Order, "id" | "number" | "createdAt" | "updatedAt" | "activities">): Promise<Order> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    return locked(async () => {
      const snapshot = await readFileStore();
      const existing = snapshot.orders.find((order) => order.clientToken === input.clientToken);
      if (existing) return existing;
      const order: Order = {
        ...input,
        id: crypto.randomUUID(),
        number: nextNumber(snapshot.orders),
        activities: [blankActivity("Order received.", "house", true)],
        createdAt: now,
        updatedAt: now,
      };
      snapshot.orders.unshift(order);
      touchCustomer(snapshot, { name: order.customerName, phone: order.phone, email: order.email }, "order");
      await writeFileStore(snapshot);
      return order;
    });
  }
  const snapshot = await getSnapshot();
  const existing = snapshot.orders.find((order) => order.clientToken === input.clientToken);
  if (existing) return existing;
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    number: nextNumber(snapshot.orders),
    activities: [blankActivity("Order received.", "house", true)],
    createdAt: now,
    updatedAt: now,
  };
  await insertDoc("orders", {
    id: order.id,
    number: order.number,
    status: order.status,
    client_token: order.clientToken,
    doc: order,
  });
  return order;
}

export async function updateOrder(id: string, patch: { status?: Order["status"]; staffNotes?: string; publicNote?: string; activity?: string; author?: string; activityVisible?: boolean }) {
  const apply = (order: Order): Order => {
    const activities = [...order.activities];
    if (patch.status && patch.status !== order.status) {
      activities.unshift(blankActivity(`Status set to ${statusLabel(patch.status)}.`, patch.author || "house", true));
    }
    if (patch.activity?.trim()) {
      activities.unshift(blankActivity(patch.activity.trim(), patch.author || "house", Boolean(patch.activityVisible)));
    }
    return {
      ...order,
      status: patch.status ?? order.status,
      staffNotes: patch.staffNotes ?? order.staffNotes,
      publicNote: patch.publicNote ?? order.publicNote ?? "",
      updatedAt: new Date().toISOString(),
      activities,
    };
  };
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.orders = snapshot.orders.map((order) => (order.id === id ? apply(order) : order));
      await writeFileStore(snapshot);
    });
    return;
  }
  const snapshot = await getSnapshot();
  const current = snapshot.orders.find((order) => order.id === id);
  if (!current) throw new Error("Order not found.");
  const next = apply(current);
  await upsertDoc("orders", { id: next.id, number: next.number, status: next.status, doc: next });
}

export async function createInquiry(input: Omit<Inquiry, "id" | "createdAt" | "updatedAt" | "activities" | "status" | "staffNotes">): Promise<Inquiry> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    return locked(async () => {
      const snapshot = await readFileStore();
      const existing = snapshot.inquiries.find((inquiry) => inquiry.clientToken === input.clientToken);
      if (existing) return existing;
      const inquiry: Inquiry = { ...input, id: crypto.randomUUID(), status: "new", staffNotes: "", activities: [], createdAt: now, updatedAt: now };
      snapshot.inquiries.unshift(inquiry);
      touchCustomer(snapshot, inquiry, "inquiry");
      await writeFileStore(snapshot);
      return inquiry;
    });
  }
  const snapshot = await getSnapshot();
  const existing = snapshot.inquiries.find((inquiry) => inquiry.clientToken === input.clientToken);
  if (existing) return existing;
  const inquiry: Inquiry = { ...input, id: crypto.randomUUID(), status: "new", staffNotes: "", activities: [], createdAt: now, updatedAt: now };
  await insertDoc("inquiries", {
    id: inquiry.id,
    status: inquiry.status,
    client_token: inquiry.clientToken,
    doc: inquiry,
  });
  return inquiry;
}

export async function updateInquiry(id: string, patch: { status?: Inquiry["status"]; staffNotes?: string; activity?: string; author?: string }) {
  const apply = (inquiry: Inquiry): Inquiry => ({
    ...inquiry,
    status: patch.status ?? inquiry.status,
    staffNotes: patch.staffNotes ?? inquiry.staffNotes,
    updatedAt: new Date().toISOString(),
    activities: patch.activity
      ? [{ id: crypto.randomUUID(), at: new Date().toISOString(), author: patch.author || "house", message: patch.activity, visible: false }, ...inquiry.activities]
      : inquiry.activities,
  });
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.inquiries = snapshot.inquiries.map((inquiry) => (inquiry.id === id ? apply(inquiry) : inquiry));
      await writeFileStore(snapshot);
    });
    return;
  }
  const snapshot = await getSnapshot();
  const current = snapshot.inquiries.find((inquiry) => inquiry.id === id);
  if (!current) throw new Error("Inquiry not found.");
  const next = apply(current);
  await upsertDoc("inquiries", { id: next.id, status: next.status, doc: next });
}

export async function updateCustomerNotes(id: string, notes: string) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.customers = snapshot.customers.map((customer) => (customer.id === id ? { ...customer, notes } : customer));
      await writeFileStore(snapshot);
    });
    return;
  }
  const snapshot = await getSnapshot();
  const customer = snapshot.customers.find((item) => item.id === id);
  if (!customer) return;
  const next = { ...customer, notes };
  await upsertDoc("customers", { id: next.id, doc: next });
}

export async function recordEvents(events: Omit<AnalyticsEvent, "id" | "createdAt">[]) {
  const rows = events.map((event) => ({
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }));
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.events.push(...rows);
      if (snapshot.events.length > 5000) snapshot.events = snapshot.events.slice(-5000);
      await writeFileStore(snapshot);
    });
    return;
  }
  await insertDoc(
    "analytics_events",
    rows.map((event) => ({
      id: event.id,
      type: event.type,
      path: event.path,
      created_at: event.createdAt,
      doc: event,
    })),
  );
}

export async function importSeed() {
  const seed = createSeed();
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      await writeFileStore(seed);
    });
    return;
  }
  await upsertDoc("settings", { id: "1", doc: seed.settings });
  for (const category of seed.categories) await saveCategory(category);
  for (const item of seed.products) await saveProduct(item);
  for (const item of seed.banners) await saveBanner(item);
  for (const item of seed.pages) await savePage(item);
  for (const item of seed.sections) await saveSection(item);
  for (const item of seed.testimonials) await saveTestimonial(item);
  for (const item of seed.faqs) await saveFaq(item);
  await saveNavigation(seed.navigation);
  for (const order of seed.orders) {
    await upsertDoc("orders", { id: order.id, number: order.number, status: order.status, doc: order });
  }
  for (const inquiry of seed.inquiries) {
    await upsertDoc("inquiries", { id: inquiry.id, status: inquiry.status, doc: inquiry });
  }
  for (const customer of seed.customers) {
    await upsertDoc("customers", { id: customer.id, doc: customer });
  }
  for (const subscriber of seed.subscribers) await upsertDoc("subscribers", { id: subscriber.id, email: subscriber.email, status: subscriber.status, doc: subscriber });
  for (const campaign of seed.campaigns) await upsertDoc("campaigns", { id: campaign.id, status: campaign.status, doc: campaign });
  for (const template of seed.templates) await upsertDoc("templates", { id: template.id, doc: template });
  const supabase = await createClient();
  await supabase.from("analytics_events").upsert(
    seed.events.map((event) => ({
      id: event.id,
      type: event.type,
      path: event.path,
      created_at: event.createdAt,
      doc: event,
    })),
  );
}

export function storageMode() {
  return isSupabaseConfigured() ? "supabase" : "file";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function subscribeEmail(input: { email: string; name: string; source: string }) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("subscribe_address", { p_email: email, p_name: name, p_source: input.source });
    if (error) throw new Error(error.message);
    const payload = data as { result: "created" | "already" | "resubscribed"; subscriber: Subscriber };
    return payload;
  }
  return locked(async () => {
    const snapshot = await getSnapshot();
    const existing = snapshot.subscribers.find((subscriber) => subscriber.email === email);
    if (existing?.status === "active") return { result: "already" as const, subscriber: existing };
    if (existing) {
      const subscriber: Subscriber = {
        ...existing,
        name: name || existing.name,
        status: "active",
        token: crypto.randomUUID().replace(/-/g, ""),
        source: input.source,
        resubscribeCount: existing.resubscribeCount + 1,
        subscribedAt: now,
        unsubscribedAt: null,
      };
      await writeSubscriber(snapshot, subscriber);
      return { result: "resubscribed" as const, subscriber };
    }
    const subscriber: Subscriber = {
      id: crypto.randomUUID(),
      email,
      name,
      status: "active",
      token: crypto.randomUUID().replace(/-/g, ""),
      source: input.source,
      resubscribeCount: 0,
      subscribedAt: now,
      unsubscribedAt: null,
      createdAt: now,
    };
    await writeSubscriber(snapshot, subscriber);
    return { result: "created" as const, subscriber };
  });
}

async function writeSubscriber(snapshot: StoreSnapshot, subscriber: Subscriber) {
  if (!isSupabaseConfigured()) {
    const index = snapshot.subscribers.findIndex((item) => item.id === subscriber.id);
    if (index >= 0) snapshot.subscribers[index] = subscriber;
    else snapshot.subscribers.unshift(subscriber);
    await writeFileStore(snapshot);
    return;
  }
  await upsertDoc("subscribers", { id: subscriber.id, email: subscriber.email, status: subscriber.status, doc: subscriber });
}

export async function unsubscribeByToken(token: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("unsubscribe_token", { p_token: token });
    if (error) throw new Error(error.message);
    return (data as "ok" | "missing" | "already") || "missing";
  }
  const snapshot = await getSnapshot();
  const existing = snapshot.subscribers.find((subscriber) => subscriber.token === token);
  if (!existing) return "missing" as const;
  if (existing.status === "unsubscribed") return "already" as const;
  const subscriber: Subscriber = { ...existing, status: "unsubscribed", unsubscribedAt: new Date().toISOString() };
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const fresh = await readFileStore();
      const index = fresh.subscribers.findIndex((item) => item.id === subscriber.id);
      if (index >= 0) fresh.subscribers[index] = subscriber;
      await writeFileStore(fresh);
    });
  } else {
    await writeSubscriber(snapshot, subscriber);
  }
  return "ok" as const;
}

export async function saveTemplate(template: EmailTemplate) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.templates = snapshot.templates.map((item) => (item.id === template.id ? template : item));
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("templates", { id: template.id, doc: template });
}

export async function saveCampaign(campaign: Campaign) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      const index = snapshot.campaigns.findIndex((item) => item.id === campaign.id);
      if (index >= 0) snapshot.campaigns[index] = campaign;
      else snapshot.campaigns.unshift(campaign);
      await writeFileStore(snapshot);
    });
    return;
  }
  await upsertDoc("campaigns", { id: campaign.id, status: campaign.status, doc: campaign });
}

export async function recordDelivery(delivery: Delivery) {
  if (!isSupabaseConfigured()) {
    await locked(async () => {
      const snapshot = await readFileStore();
      snapshot.deliveries.unshift(delivery);
      await writeFileStore(snapshot);
    });
    return;
  }
  await insertDoc("deliveries", { id: delivery.id, campaign_id: delivery.campaignId, doc: delivery });
}

export async function findOrderForCustomer(number: string, phone: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("lookup_order", { order_number: number.trim(), phone_digits: digitsOnly(phone) });
    if (error) throw new Error(error.message);
    return (data as Order | null) || null;
  }
  const snapshot = await getSnapshot();
  const wanted = number.trim().toLowerCase();
  const digits = digitsOnly(phone);
  const order = snapshot.orders.find((item) => item.number.toLowerCase() === wanted && digitsOnly(item.phone) === digits);
  return order || null;
}
