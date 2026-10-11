export type ProductStatus = "active" | "draft";
export type OrderStatus = "new" | "accepted" | "confirmed" | "packed" | "shipped" | "fulfilled" | "cancelled";
export type SubscriberStatus = "active" | "unsubscribed";
export type CampaignStatus = "draft" | "sending" | "sent";
export type DeliveryStatus = "sent" | "failed" | "skipped";
export type InquiryStatus = "new" | "in_progress" | "resolved";
export type InquiryType = "contact" | "product" | "newsletter" | "order";
export type EventType =
  | "page_view"
  | "button_click"
  | "add_to_cart"
  | "whatsapp_click"
  | "inquiry_submit"
  | "order_submit"
  | "search";
export type DeviceType = "mobile" | "tablet" | "desktop";
export type NavLocation = "header" | "footer_shop" | "footer_help" | "footer_company";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sort: number;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  options: Record<string, string>;
  available: boolean;
  stock: number;
  imageUrl?: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  categoryId: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  material: string;
  care: string;
  dimensions: string;
  featured: boolean;
  bestseller: boolean;
  status: ProductStatus;
  seoTitle: string;
  seoDescription: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  sort: number;
  visible: boolean;
};

export type Banner = {
  id: string;
  placement: "hero" | "promo";
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  buttonLabel: string;
  buttonHref: string;
  align: "left" | "center";
  tone: "light" | "dark";
  active: boolean;
  sort: number;
};

export type SectionBase = {
  id: string;
  pageSlug: string;
  visible: boolean;
  sort: number;
};

export type Section =
  | (SectionBase & { type: "hero" })
  | (SectionBase & {
      type: "product_grid";
      title: string;
      subtitle: string;
      source: "featured" | "bestsellers" | "new";
      limit: number;
    })
  | (SectionBase & {
      type: "image_text";
      eyebrow: string;
      title: string;
      body: string;
      imageUrl: string;
      imageAlt: string;
      buttonLabel: string;
      buttonHref: string;
      align: "left" | "right";
    })
  | (SectionBase & { type: "categories"; title: string; subtitle: string })
  | (SectionBase & {
      type: "values";
      title: string;
      items: { title: string; text: string }[];
    })
  | (SectionBase & { type: "testimonials"; title: string; subtitle: string })
  | (SectionBase & {
      type: "newsletter";
      title: string;
      subtitle: string;
      buttonLabel: string;
    })
  | (SectionBase & { type: "rich_text"; title: string; body: string })
  | (SectionBase & { type: "faq"; title: string; subtitle: string })
  | (SectionBase & {
      type: "promo";
      eyebrow: string;
      title: string;
      body: string;
      imageUrl: string;
      imageAlt: string;
      buttonLabel: string;
      buttonHref: string;
    })
  | (SectionBase & { type: "contact"; title: string; subtitle: string })
  | (SectionBase & {
      type: "gallery";
      title: string;
      subtitle: string;
      images: { url: string; alt: string }[];
    });

export type CmsPage = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  kind: "home" | "system" | "page";
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  detail: string;
  rating: number;
  visible: boolean;
  sort: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  sort: number;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  location: NavLocation;
  sort: number;
  visible: boolean;
};

export type Settings = {
  storeName: string;
  logoUrl: string;
  tagline: string;
  announcement: string;
  announcementEnabled: boolean;
  whatsappNumber: string;
  whatsappGreeting: string;
  email: string;
  phoneDisplay: string;
  address: string;
  city: string;
  hours: string;
  instagram: string;
  currency: string;
  gaMeasurementId: string;
  footerNote: string;
  metaTitle: string;
  metaDescription: string;
  emailFrom: string;
  popupEnabled: boolean;
  popupTitle: string;
  popupBody: string;
  sceneEnabled: boolean;
  sceneAssetUrl: string;
  sceneYaw: number;
  sceneCaption: string;
};

export type Activity = {
  id: string;
  at: string;
  author: string;
  message: string;
  visible: boolean;
};

export type OrderItem = {
  productId: string;
  slug: string;
  title: string;
  variantId: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
};

export type Order = {
  id: string;
  number: string;
  clientToken: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  staffNotes: string;
  publicNote: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  sourcePath: string;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
};

export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  phone: string;
  email: string;
  message: string;
  productTitle: string;
  productSlug: string;
  status: InquiryStatus;
  staffNotes: string;
  pagePath: string;
  clientToken: string;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  orderCount: number;
  inquiryCount: number;
  createdAt: string;
  lastSeenAt: string;
};

export type AnalyticsEvent = {
  id: string;
  type: EventType;
  path: string;
  label: string;
  elementId: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  device: DeviceType;
  browser: string;
  os: string;
  screen: string;
  sessionId: string;
  createdAt: string;
};

export type EmailTemplate = {
  id: "welcome" | "welcome_back" | "order_update";
  name: string;
  subject: string;
  body: string;
};

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  status: SubscriberStatus;
  token: string;
  source: string;
  resubscribeCount: number;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
};

export type Delivery = {
  id: string;
  campaignId: string;
  subscriberId: string;
  email: string;
  status: DeliveryStatus;
  error: string;
  sentAt: string;
};

export type StoreSnapshot = {
  settings: Settings;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  pages: CmsPage[];
  sections: Section[];
  testimonials: Testimonial[];
  faqs: Faq[];
  navigation: NavItem[];
  orders: Order[];
  inquiries: Inquiry[];
  customers: Customer[];
  events: AnalyticsEvent[];
  subscribers: Subscriber[];
  campaigns: Campaign[];
  deliveries: Delivery[];
  templates: EmailTemplate[];
};

export type AdminSession = {
  email: string;
  role: "admin" | "staff";
  mode: "demo" | "supabase";
};
