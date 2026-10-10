import { defaultTemplates } from "@/lib/migrate";
import type {
  AnalyticsEvent,
  Campaign,
  Subscriber,
  Banner,
  Category,
  CmsPage,
  Customer,
  Faq,
  Inquiry,
  NavItem,
  Order,
  Product,
  ProductImage,
  ProductOption,
  ProductVariant,
  Section,
  Settings,
  StoreSnapshot,
  Testimonial,
} from "@/lib/types";

const NOW = "2026-09-20T09:00:00.000Z";

function image(url: string, alt: string, sort = 0): ProductImage {
  return { id: `${url}-${sort}`, url, alt, sort };
}

function cartesian(options: ProductOption[]) {
  return options.reduce<Record<string, string>[]>(
    (acc, option) => acc.flatMap((base) => option.values.map((value) => ({ ...base, [option.name]: value }))),
    [{}],
  );
}

function makeVariants(
  productId: string,
  sku: string,
  options: ProductOption[],
  priceOf: (selected: Record<string, string>) => number,
  imageOf?: (selected: Record<string, string>) => string | undefined,
): ProductVariant[] {
  return cartesian(options).map((selected) => {
    const key = Object.values(selected).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: `${productId}-${key}`,
      title: Object.values(selected).join(" / "),
      sku: `${sku}-${key}`.toUpperCase(),
      price: priceOf(selected),
      compareAtPrice: null,
      options: selected,
      available: true,
      stock: 18,
      imageUrl: imageOf?.(selected),
    };
  });
}

function product(input: Omit<Product, "createdAt" | "updatedAt">): Product {
  return { ...input, createdAt: NOW, updatedAt: NOW };
}

const categories: Category[] = [
  {
    id: "cat-towels",
    name: "Towels",
    slug: "towels",
    description: "Turkish cotton bath towels, peshtemals, and the cloth you reach for twice a day.",
    imageUrl: "/images/categories/towels.jpg",
    imageAlt: "Stone bathroom with stacked ivory towels",
    sort: 1,
    visible: true,
  },
  {
    id: "cat-pillows",
    name: "Pillows",
    slug: "pillows",
    description: "Hotel fill, down-alternative pairs, and linen shams with a proper flange.",
    imageUrl: "/images/categories/pillows.jpg",
    imageAlt: "Two white hotel pillows on limestone",
    sort: 2,
    visible: true,
  },
  {
    id: "cat-bedsheets",
    name: "Bedsheets",
    slug: "bedsheets",
    description: "Percale, sateen, and washed linen, cut for a bed that is made every morning.",
    imageUrl: "/images/categories/bedsheets.jpg",
    imageAlt: "Ivory bed dressed in percale",
    sort: 3,
    visible: true,
  },
  {
    id: "cat-bath",
    name: "Bath Wear",
    slug: "bath-wear",
    description: "Waffle and terry robes, a bath wrap, and the mat beside the tub.",
    imageUrl: "/images/categories/bath-wear.jpg",
    imageAlt: "White terry robe on a brass hook",
    sort: 4,
    visible: true,
  },
];

const ivory = "/images/products/signature-towel.jpg";
const sage = "/images/products/sage-towel.jpg";

const products: Product[] = [
  product({
    id: "prod-signature-towel",
    title: "Signature Bath Towel",
    slug: "signature-bath-towel",
    shortDescription: "Long-staple Turkish cotton at 700 GSM, with a dobby border that stays flat.",
    description:
      "Woven from long-staple Turkish cotton and finished at 700 grams. The pile stays dense after a hot wash, and the dobby border keeps the hem from curling. Sold one at a time, so a set can be built in Ivory or Sage.\n\nBath size is the daily towel. Hand and wash share the same cloth.",
    price: 4800,
    compareAtPrice: 6200,
    sku: "CHL-TWL-SIG",
    categoryId: "cat-towels",
    images: [image(ivory, "Stack of ivory Turkish bath towels"), image(sage, "Stack of sage Turkish bath towels", 1)],
    options: [
      { name: "Color", values: ["Ivory", "Sage"] },
      { name: "Size", values: ["Bath", "Hand", "Wash"] },
    ],
    variants: [],
    material: "100% Turkish cotton, 700 GSM",
    care: "Machine wash warm with like colors. Tumble dry low. Skip fabric softener — it flattens the pile.",
    dimensions: "Bath 70 × 140 cm. Hand 50 × 90 cm. Wash 30 × 30 cm.",
    featured: true,
    bestseller: true,
    status: "active",
    seoTitle: "Signature Bath Towel — CrownHomeLinen",
    seoDescription: "A 700 GSM Turkish cotton bath towel in Ivory or Sage. Order on WhatsApp.",
    sort: 1,
  }),
  product({
    id: "prod-bath-sheet",
    title: "Charcoal Bath Sheet",
    slug: "charcoal-bath-sheet",
    shortDescription: "An oversized bath sheet in charcoal terry, cut wide enough to wrap.",
    description:
      "The bath sheet is the towel you take to the guest room. Same Turkish cotton as the Signature, woven heavier and wider, in a charcoal that hides a damp floor and still looks considered on the rail.",
    price: 6800,
    compareAtPrice: null,
    sku: "CHL-TWL-SHEET",
    categoryId: "cat-towels",
    images: [image("/images/products/charcoal-bath-sheet.jpg", "Folded charcoal bath sheet")],
    options: [{ name: "Color", values: ["Charcoal"] }],
    variants: [],
    material: "100% Turkish cotton, 650 GSM",
    care: "Wash warm, dry low. Shake it out once before it goes back on the rail.",
    dimensions: "90 × 160 cm.",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "Charcoal Bath Sheet — CrownHomeLinen",
    seoDescription: "Oversized charcoal Turkish cotton bath sheet.",
    sort: 2,
  }),
  product({
    id: "prod-hand-towels",
    title: "Heritage Hand Towel Set",
    slug: "heritage-hand-towel-set",
    shortDescription: "A pair of ivory hand towels with a woven chevron border.",
    description:
      "Two hand towels, cut from the same terry as the Signature bath towel and finished with a chevron dobby. They live by the basin. The set is ivory only, so it sits with either color of bath towel.",
    price: 3600,
    compareAtPrice: null,
    sku: "CHL-TWL-HAND",
    categoryId: "cat-towels",
    images: [image("/images/products/hand-towels.jpg", "Two ivory hand towels and a brass ring")],
    options: [{ name: "Set", values: ["Pair"] }],
    variants: [],
    material: "100% Turkish cotton, 700 GSM",
    care: "Machine wash warm. Dry low.",
    dimensions: "Set of 2. Each towel 50 × 90 cm.",
    featured: true,
    bestseller: false,
    status: "active",
    seoTitle: "Heritage Hand Towel Set — CrownHomeLinen",
    seoDescription: "A pair of ivory Turkish cotton hand towels.",
    sort: 3,
  }),
  product({
    id: "prod-peshtemal",
    title: "Coastal Peshtemal",
    slug: "coastal-peshtemal",
    shortDescription: "A light sand-striped hammam towel that dries fast and folds flat.",
    description:
      "Loom-woven cotton gauze with sand stripes on ivory. It is the towel for a guest bed end, a beach bag, or the hook behind the door. It dries in an hour and takes almost no room in a cupboard.",
    price: 4200,
    compareAtPrice: null,
    sku: "CHL-TWL-PESH",
    categoryId: "cat-towels",
    images: [image("/images/products/peshtemal.jpg", "Sand striped peshtemal draped on stone")],
    options: [{ name: "Color", values: ["Sand stripe"] }],
    variants: [],
    material: "100% cotton gauze",
    care: "Wash cold. Hang dry. It softens each time.",
    dimensions: "100 × 180 cm.",
    featured: false,
    bestseller: true,
    status: "active",
    seoTitle: "Coastal Peshtemal — CrownHomeLinen",
    seoDescription: "Lightweight sand-striped Turkish peshtemal.",
    sort: 4,
  }),
  product({
    id: "prod-hotel-pillow",
    title: "Hotel Classic Pillow",
    slug: "hotel-classic-pillow",
    shortDescription: "A boxed hotel pillow in a cotton cambric case. Soft, medium, or firm.",
    description:
      "Filled to a hotel weight and finished with a piped edge so it holds a shape on the bed. Choose the fill, then the size. The case is cotton cambric and is not removed — the pillow is washed in its cover.",
    price: 5800,
    compareAtPrice: null,
    sku: "CHL-PLW-HTL",
    categoryId: "cat-pillows",
    images: [image("/images/products/hotel-pillow.jpg", "White hotel pillow on limestone")],
    options: [
      { name: "Feel", values: ["Soft", "Medium", "Firm"] },
      { name: "Size", values: ["Standard", "King"] },
    ],
    variants: [],
    material: "Cotton cambric cover. Siliconized down-alternative fill.",
    care: "Machine wash warm in the cover. Tumble dry low and shake the fill back to the corners.",
    dimensions: "Standard 50 × 75 cm. King 50 × 90 cm.",
    featured: true,
    bestseller: false,
    status: "active",
    seoTitle: "Hotel Classic Pillow — CrownHomeLinen",
    seoDescription: "Hotel-weight pillow in soft, medium, or firm.",
    sort: 5,
  }),
  product({
    id: "prod-pillow-pair",
    title: "Down-Alternative Pillow Pair",
    slug: "down-alternative-pillow-pair",
    shortDescription: "Two medium pillows, sold as the pair a bed actually needs.",
    description:
      "The pair is the simplest way to dress a bed. Medium fill, cotton cases, boxed edges. They are the pillows already on the percale and sateen beds in the house photographs.",
    price: 8600,
    compareAtPrice: 9800,
    sku: "CHL-PLW-PAIR",
    categoryId: "cat-pillows",
    images: [image("/images/products/pillow-pair.jpg", "Pair of white pillows leaning together")],
    options: [{ name: "Set", values: ["Pair, medium"] }],
    variants: [],
    material: "Cotton cover. Down-alternative fill.",
    care: "Wash one at a time, warm, and dry low.",
    dimensions: "Two pillows, each 50 × 75 cm.",
    featured: false,
    bestseller: true,
    status: "active",
    seoTitle: "Down-Alternative Pillow Pair — CrownHomeLinen",
    seoDescription: "A pair of medium hotel pillows.",
    sort: 6,
  }),
  product({
    id: "prod-euro-sham",
    title: "Flanged Euro Sham",
    slug: "flanged-euro-sham",
    shortDescription: "A square oatmeal linen sham with a wide flange, for the back of the bed.",
    description:
      "Cut from washed European flax. The flange is top-stitched and wide enough to read from the doorway. It sits behind the sleeping pillows and does not need a filler of its own if you already own a euro insert — one is not included.",
    price: 4600,
    compareAtPrice: null,
    sku: "CHL-PLW-SHAM",
    categoryId: "cat-pillows",
    images: [image("/images/products/euro-sham.jpg", "Oatmeal linen euro sham")],
    options: [{ name: "Color", values: ["Oatmeal"] }],
    variants: [],
    material: "100% washed European linen",
    care: "Wash cold on a gentle cycle. Hang dry. It is meant to crease.",
    dimensions: "65 × 65 cm, flange included. Insert not included.",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "Flanged Euro Sham — CrownHomeLinen",
    seoDescription: "Washed oatmeal linen euro sham with a wide flange.",
    sort: 7,
  }),
  product({
    id: "prod-percale",
    title: "Percale Sheet Set",
    slug: "percale-sheet-set",
    shortDescription: "Crisp ivory percale. A flat sheet, a fitted sheet, and two pillowcases.",
    description:
      "A 400-thread percale that feels cool on the first night and stays matte. The fitted sheet has a deep pocket and extra elastic at the corners. Ivory is the house color. White is the same cloth, bleached once.",
    price: 18900,
    compareAtPrice: 22000,
    sku: "CHL-BED-PERC",
    categoryId: "cat-bedsheets",
    images: [
      image("/images/products/percale-sheets.jpg", "Folded ivory percale sheets"),
      image("/images/heroes/bed.jpg", "Bed dressed in ivory percale", 1),
    ],
    options: [
      { name: "Color", values: ["Ivory", "White"] },
      { name: "Size", values: ["Queen", "King"] },
    ],
    variants: [],
    material: "100% long-staple cotton percale, 400 thread count",
    care: "Wash warm. Tumble dry low. Take the set out while it is faintly damp if you want a pressed bed.",
    dimensions: "Queen fitted to 40 cm deep. King fitted to 40 cm deep. Two pillowcases included.",
    featured: true,
    bestseller: true,
    status: "active",
    seoTitle: "Percale Sheet Set — CrownHomeLinen",
    seoDescription: "Crisp ivory or white cotton percale sheet set.",
    sort: 8,
  }),
  product({
    id: "prod-sateen",
    title: "Sateen Duvet Cover",
    slug: "sateen-duvet-cover",
    shortDescription: "Champagne sateen with a quiet sheen and coconut-shell buttons.",
    description:
      "Sateen is the warmer hand in the house: a tighter weave, a soft lustre, and a drape that holds a fold. The closure is a row of coconut-shell buttons, hidden inside the foot. The duvet itself is not included.",
    price: 16500,
    compareAtPrice: null,
    sku: "CHL-BED-SAT",
    categoryId: "cat-bedsheets",
    images: [image("/images/products/sateen-duvet.jpg", "Folded champagne sateen")],
    options: [
      { name: "Color", values: ["Champagne"] },
      { name: "Size", values: ["Queen", "King"] },
    ],
    variants: [],
    material: "100% cotton sateen",
    care: "Wash cool. Dry low. Button it closed before it goes in the machine.",
    dimensions: "Queen 220 × 220 cm. King 240 × 220 cm.",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "Sateen Duvet Cover — CrownHomeLinen",
    seoDescription: "Champagne cotton sateen duvet cover.",
    sort: 9,
  }),
  product({
    id: "prod-linen",
    title: "Washed Linen Sheet Set",
    slug: "washed-linen-sheet-set",
    shortDescription: "Stonewashed flax in sand. It arrives creased and stays that way, on purpose.",
    description:
      "European flax, garment-washed so the slub is already soft. The set is a flat sheet, a fitted sheet, and two pillowcases. Sand is the only color. It is the bed in the late photograph, when the light is low.",
    price: 24000,
    compareAtPrice: null,
    sku: "CHL-BED-LIN",
    categoryId: "cat-bedsheets",
    images: [image("/images/products/linen-sheets.jpg", "Folded sand washed linen sheets")],
    options: [
      { name: "Color", values: ["Sand"] },
      { name: "Size", values: ["Queen", "King"] },
    ],
    variants: [],
    material: "100% European flax linen",
    care: "Wash cold. Hang dry. Do not iron unless you want to. The crease is the finish.",
    dimensions: "Queen or King. Fitted sheet pocket 40 cm. Two pillowcases.",
    featured: true,
    bestseller: true,
    status: "active",
    seoTitle: "Washed Linen Sheet Set — CrownHomeLinen",
    seoDescription: "Stonewashed sand linen sheets for queen or king.",
    sort: 10,
  }),
  product({
    id: "prod-waffle-robe",
    title: "Waffle Bath Robe",
    slug: "waffle-bath-robe",
    shortDescription: "An oatmeal waffle robe with patch pockets and a cloth belt.",
    description:
      "Honeycomb cotton, light enough for a warm bathroom and absorbent enough after a shower. Unisex cut, knee length, with a shawl collar. It hangs from a brass hook in the house bathroom.",
    price: 12800,
    compareAtPrice: null,
    sku: "CHL-BATH-WAF",
    categoryId: "cat-bath",
    images: [image("/images/products/waffle-robe.jpg", "Oatmeal waffle robe on a brass hook")],
    options: [{ name: "Size", values: ["Small", "Medium", "Large"] }],
    variants: [],
    material: "100% cotton waffle",
    care: "Wash warm. Hang dry on a wide hanger so the shoulders keep their shape.",
    dimensions: "Small, medium, and large. Knee length. Unisex.",
    featured: true,
    bestseller: false,
    status: "active",
    seoTitle: "Waffle Bath Robe — CrownHomeLinen",
    seoDescription: "Oatmeal cotton waffle bath robe.",
    sort: 11,
  }),
  product({
    id: "prod-spa-robe",
    title: "Terry Spa Robe",
    slug: "terry-spa-robe",
    shortDescription: "A white terry robe with a shawl collar, for the cold hour after a bath.",
    description:
      "The heavier robe. Loop-pile Turkish cotton, white, with pockets deep enough for a book. It is the robe you lend, and the one you keep on the back of the door in winter.",
    price: 14800,
    compareAtPrice: null,
    sku: "CHL-BATH-TERY",
    categoryId: "cat-bath",
    images: [image("/images/products/spa-robe.jpg", "White terry spa robe")],
    options: [{ name: "Size", values: ["Small", "Medium", "Large"] }],
    variants: [],
    material: "100% Turkish cotton terry",
    care: "Wash warm. Tumble dry low. Close the belt before washing so it does not knot.",
    dimensions: "Small, medium, and large. Below the knee.",
    featured: false,
    bestseller: true,
    status: "active",
    seoTitle: "Terry Spa Robe — CrownHomeLinen",
    seoDescription: "White Turkish cotton terry spa robe.",
    sort: 12,
  }),
  product({
    id: "prod-bath-wrap",
    title: "Bath Wrap",
    slug: "bath-wrap",
    shortDescription: "A short ivory wrap in the Signature terry, for hair washed and nowhere to be.",
    description:
      "Cut short from the same 700 GSM cloth as the Signature towel, with a dobby band. It is not a robe. It is the wrap you use while the robe is in the wash.",
    price: 5400,
    compareAtPrice: null,
    sku: "CHL-BATH-WRAP",
    categoryId: "cat-bath",
    images: [image("/images/products/bath-wrap.jpg", "Folded ivory bath wrap")],
    options: [{ name: "Size", values: ["One size"] }],
    variants: [],
    material: "100% Turkish cotton, 700 GSM",
    care: "Wash warm with the towels.",
    dimensions: "One size. About 80 × 140 cm.",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "Bath Wrap — CrownHomeLinen",
    seoDescription: "Short ivory Turkish cotton bath wrap.",
    sort: 13,
  }),
  product({
    id: "prod-bath-mat",
    title: "Plush Bath Mat",
    slug: "plush-bath-mat",
    shortDescription: "A bordered ivory mat, dense enough that the stone stays dry.",
    description:
      "A cotton bath mat with a carved border and a dense centre. It is sized for one person stepping out of the tub. The back is a plain cotton weave. It is not backed with rubber, so it can be washed whole.",
    price: 3800,
    compareAtPrice: null,
    sku: "CHL-BATH-MAT",
    categoryId: "cat-bath",
    images: [image("/images/products/bath-mat.jpg", "Ivory bath mat on limestone")],
    options: [{ name: "Color", values: ["Ivory"] }],
    variants: [],
    material: "100% cotton",
    care: "Wash cold, separately the first time. Dry low.",
    dimensions: "50 × 80 cm.",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "Plush Bath Mat — CrownHomeLinen",
    seoDescription: "Ivory cotton bath mat with a carved border.",
    sort: 14,
  }),
];

const sizePrice: Record<string, number> = { Bath: 4800, Hand: 2800, Wash: 1600 };
products[0].variants = makeVariants(
  products[0].id,
  products[0].sku,
  products[0].options,
  (selected) => sizePrice[selected.Size] ?? 4800,
  (selected) => (selected.Color === "Sage" ? sage : ivory),
).map((variant) =>
  variant.options.Size === "Bath" ? { ...variant, compareAtPrice: 6200 } : variant,
);

products[1].variants = makeVariants(products[1].id, products[1].sku, products[1].options, () => 6800);
products[2].variants = makeVariants(products[2].id, products[2].sku, products[2].options, () => 3600);
products[3].variants = makeVariants(products[3].id, products[3].sku, products[3].options, () => 4200);
products[4].variants = makeVariants(products[4].id, products[4].sku, products[4].options, (selected) =>
  selected.Size === "King" ? 6800 : 5800,
);
products[5].variants = makeVariants(products[5].id, products[5].sku, products[5].options, () => 8600).map((variant) => ({
  ...variant,
  compareAtPrice: 9800,
}));
products[6].variants = makeVariants(products[6].id, products[6].sku, products[6].options, () => 4600);
products[7].variants = makeVariants(products[7].id, products[7].sku, products[7].options, (selected) =>
  selected.Size === "King" ? 21400 : 18900,
).map((variant) => (variant.options.Size === "Queen" ? { ...variant, compareAtPrice: 22000 } : variant));
products[8].variants = makeVariants(products[8].id, products[8].sku, products[8].options, (selected) =>
  selected.Size === "King" ? 18800 : 16500,
);
products[9].variants = makeVariants(products[9].id, products[9].sku, products[9].options, (selected) =>
  selected.Size === "King" ? 26800 : 24000,
);
products[10].variants = makeVariants(products[10].id, products[10].sku, products[10].options, (selected) =>
  selected.Size === "Large" ? 13600 : 12800,
);
products[11].variants = makeVariants(products[11].id, products[11].sku, products[11].options, () => 14800);
products[12].variants = makeVariants(products[12].id, products[12].sku, products[12].options, () => 5400);
products[13].variants = makeVariants(products[13].id, products[13].sku, products[13].options, () => 3800);

const settings: Settings = {
  storeName: "CrownHomeLinen",
  tagline: "Towels, pillows, and bed linen. Ordered by message.",
  announcement: "Orders are confirmed on WhatsApp — we answer by hand.",
  announcementEnabled: true,
  whatsappNumber: "15551234567",
  whatsappGreeting: "Hello CrownHomeLinen, I would like to ask about a piece.",
  email: "hello@crownhomelinen.com",
  phoneDisplay: "+1 555 123 4567",
  address: "14 Linen Yard",
  city: "Colombo",
  hours: "Messages answered daily, 9:00–18:00.",
  instagram: "https://instagram.com/crownhomelinen",
  currency: "USD",
  gaMeasurementId: "",
  footerNote: "CrownHomeLinen sells towels, pillows, bedsheets, and bath wear. There is no card checkout. An order is a message, then a confirmation.",
  metaTitle: "CrownHomeLinen — Towels, pillows, and bed linen",
  metaDescription: "A house shop for Turkish cotton towels, hotel pillows, percale, linen, and bath robes. Every order is placed on WhatsApp.",
  emailFrom: "CrownHomeLinen <hello@crownhomelinen.com>",
  popupEnabled: true,
  popupTitle: "A note, occasionally",
  popupBody: "New cloth and the occasional house letter. Leave an email, and leave whenever you like.",
  sceneEnabled: true,
  sceneAssetUrl: "",
  sceneYaw: 0,
  sceneCaption: "The stack turns as you move down the page.",
};

const banners: Banner[] = [
  {
    id: "ban-bath",
    placement: "hero",
    eyebrow: "The bath",
    title: "Towels with a proper weight",
    subtitle: "Turkish cotton at 700 grams. Ivory, sage, and a charcoal sheet cut wide enough to wrap.",
    imageUrl: "/images/heroes/bath.jpg",
    imageAlt: "Sunlit stone bathroom with ivory towels",
    buttonLabel: "Shop towels",
    buttonHref: "/collections/towels",
    align: "left",
    tone: "light",
    active: true,
    sort: 1,
  },
  {
    id: "ban-bed",
    placement: "hero",
    eyebrow: "The bed",
    title: "Percale for the cool side",
    subtitle: "A matte cotton sheet set, a champagne sateen, and washed linen that arrives already soft.",
    imageUrl: "/images/heroes/bed.jpg",
    imageAlt: "Ivory percale bed in morning light",
    buttonLabel: "Shop the bed",
    buttonHref: "/collections/bedsheets",
    align: "left",
    tone: "light",
    active: true,
    sort: 2,
  },
  {
    id: "ban-robe",
    placement: "hero",
    eyebrow: "After the bath",
    title: "A robe on the brass hook",
    subtitle: "Waffle for warm rooms. Terry for the hour after. Both ordered the same way — a message.",
    imageUrl: "/images/heroes/robe.jpg",
    imageAlt: "Waffle robe and towels in a stone bathroom",
    buttonLabel: "Shop bath wear",
    buttonHref: "/collections/bath-wear",
    align: "left",
    tone: "light",
    active: true,
    sort: 3,
  },
];

const pages: CmsPage[] = [
  { slug: "home", title: "Home", seoTitle: settings.metaTitle, seoDescription: settings.metaDescription, published: true, kind: "home" },
  { slug: "shop", title: "Shop", seoTitle: "Shop the house — CrownHomeLinen", seoDescription: "All towels, pillows, bedsheets, and bath wear.", published: true, kind: "system" },
  { slug: "about", title: "Our House", seoTitle: "Our house — CrownHomeLinen", seoDescription: "How CrownHomeLinen chooses cloth and confirms every order on WhatsApp.", published: true, kind: "page" },
  { slug: "contact", title: "Contact", seoTitle: "Contact — CrownHomeLinen", seoDescription: "Write to CrownHomeLinen. Inquiries are kept in the house book and answered on WhatsApp.", published: true, kind: "page" },
  { slug: "faq", title: "Questions", seoTitle: "Questions — CrownHomeLinen", seoDescription: "Shipping, care, and how a WhatsApp order works.", published: true, kind: "page" },
  { slug: "shipping", title: "Shipping", seoTitle: "Shipping — CrownHomeLinen", seoDescription: "How CrownHomeLinen ships an order after it is confirmed.", published: true, kind: "page" },
  { slug: "returns", title: "Returns", seoTitle: "Returns — CrownHomeLinen", seoDescription: "How to return an unused piece.", published: true, kind: "page" },
  { slug: "privacy", title: "Privacy", seoTitle: "Privacy — CrownHomeLinen", seoDescription: "What CrownHomeLinen keeps when you place an order or write to the house.", published: true, kind: "page" },
  { slug: "care", title: "Cloth care", seoTitle: "Cloth care — CrownHomeLinen", seoDescription: "How to wash the towels, linen, and robes.", published: true, kind: "page" },
];

const sections: Section[] = [
  { id: "sec-home-hero", pageSlug: "home", type: "hero", visible: true, sort: 1 },
  { id: "sec-home-cats", pageSlug: "home", type: "categories", title: "Four cloths", subtitle: "Towels, pillows, the bed, and what you wear out of the bath.", visible: true, sort: 2 },
  { id: "sec-home-featured", pageSlug: "home", type: "product_grid", title: "The edit", subtitle: "Pieces we keep on the rail and on the bed.", source: "featured", limit: 4, visible: true, sort: 3 },
  {
    id: "sec-home-story",
    pageSlug: "home",
    type: "image_text",
    eyebrow: "The house",
    title: "Cloth first. Then a message.",
    body: "CrownHomeLinen is a small house shop. We sell the things that touch skin every day: the towel, the pillow, the sheet, the robe. There is no card form. You choose a piece, we open a WhatsApp thread, and a person confirms the color, the size, and the address.",
    imageUrl: "/images/editorial/still-life.jpg",
    imageAlt: "Ivory towels and a folded sheet on limestone",
    buttonLabel: "Read the house note",
    buttonHref: "/about",
    align: "right",
    visible: true,
    sort: 4,
  },
  {
    id: "sec-home-promo",
    pageSlug: "home",
    type: "promo",
    eyebrow: "Now in the cupboard",
    title: "Washed linen, already soft",
    body: "The sand sheet set is garment-washed. It creases. That is the cloth, not a fault.",
    imageUrl: "/images/heroes/bed.jpg",
    imageAlt: "A bed in morning light",
    buttonLabel: "View the linen set",
    buttonHref: "/products/washed-linen-sheet-set",
    visible: true,
    sort: 5,
  },
  { id: "sec-home-best", pageSlug: "home", type: "product_grid", title: "Often asked for", subtitle: "What the house sends most weeks.", source: "bestsellers", limit: 4, visible: true, sort: 6 },
  {
    id: "sec-home-values",
    pageSlug: "home",
    type: "values",
    title: "A short account of the shop",
    items: [
      { title: "Heavy where it should be", text: "Bath towels are 700 grams. The pile is the point." },
      { title: "Cool where it should be", text: "Percale stays matte. Linen is washed before it is folded." },
      { title: "One thread, not a queue", text: "Your order opens a WhatsApp conversation with the house." },
      { title: "Nothing is charged in the dark", text: "We confirm the total in the thread before anything is packed." },
    ],
    visible: true,
    sort: 7,
  },
  { id: "sec-home-quotes", pageSlug: "home", type: "testimonials", title: "Notes we kept", subtitle: "A few lines from orders, printed with permission.", visible: true, sort: 8 },
  {
    id: "sec-home-gallery",
    pageSlug: "home",
    type: "gallery",
    title: "On the stone",
    subtitle: "The same light, different cloth.",
    images: [
      { url: "/images/products/signature-towel.jpg", alt: "Ivory bath towels" },
      { url: "/images/products/euro-sham.jpg", alt: "Linen euro sham" },
      { url: "/images/products/linen-sheets.jpg", alt: "Washed linen sheets" },
      { url: "/images/products/spa-robe.jpg", alt: "Terry robe" },
    ],
    visible: true,
    sort: 9,
  },
  {
    id: "sec-home-note",
    pageSlug: "home",
    type: "newsletter",
    title: "Ask before you order",
    subtitle: "If you are dressing a whole room, send the list. We will answer with what is in the cupboard.",
    buttonLabel: "Open a thread",
    visible: true,
    sort: 10,
  },
  {
    id: "sec-shop-intro",
    pageSlug: "shop",
    type: "rich_text",
    title: "The house collection",
    body: "Everything currently cut and folded. Filter by cloth, or search for a weight, a size, or a color. Prices are confirmed again in the WhatsApp thread before we pack.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-about-1",
    pageSlug: "about",
    type: "image_text",
    eyebrow: "Since the first rail",
    title: "A shop the size of a cupboard",
    body: "CrownHomeLinen started as a buying list: the towel from a hotel we liked, the pillow that did not collapse, the sheet that stayed cool. We still buy that way. A cloth has to earn a place on the rail, and then it stays until we find a better one.\n\nWe do not run a checkout. The person who packs the order is the person who answers the message.",
    imageUrl: "/images/editorial/about.jpg",
    imageAlt: "Folded linen and towels on stone",
    buttonLabel: "Shop the edit",
    buttonHref: "/shop",
    align: "left",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-about-2",
    pageSlug: "about",
    type: "image_text",
    eyebrow: "How an order moves",
    title: "You write. We confirm. Then it is packed.",
    body: "Add a piece to the bag and send the order on WhatsApp. The message carries your name, the cloth, the variant, and the address. We reply with the total, the timing, and a payment instruction. Nothing leaves the cupboard until that reply is settled.\n\nInquiries are kept in the same book as orders, so a question about a robe does not disappear into a private phone.",
    imageUrl: "/images/heroes/robe.jpg",
    imageAlt: "Robe and towels in the bathroom",
    buttonLabel: "Write to the house",
    buttonHref: "/contact",
    align: "right",
    visible: true,
    sort: 2,
  },
  {
    id: "sec-about-values",
    pageSlug: "about",
    type: "values",
    title: "What we will not do",
    items: [
      { title: "No thin towels", text: "If the grams are not on the page, the cloth is not in the shop." },
      { title: "No surprise charges", text: "The thread states the total before payment." },
      { title: "No abandoned questions", text: "Every inquiry is a record, with a status, in the house book." },
    ],
    visible: true,
    sort: 3,
  },
  { id: "sec-contact", pageSlug: "contact", type: "contact", title: "Write to the house", subtitle: "Orders, swatches, and late questions. We keep the note and answer on WhatsApp.", visible: true, sort: 1 },
  { id: "sec-faq", pageSlug: "faq", type: "faq", title: "Before you write", subtitle: "If the answer is here, it will save both of us a message.", visible: true, sort: 1 },
  {
    id: "sec-shipping",
    pageSlug: "shipping",
    type: "rich_text",
    title: "Shipping",
    body: "We pack after the WhatsApp thread is confirmed. City orders inside Colombo usually leave the next working day. Island-wide parcels take two to five working days. Anything leaving the country is quoted in the thread, because the weight of a towel set changes the price.\n\nYou will receive the courier name in the same conversation. We do not ship to a post box.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-returns",
    pageSlug: "returns",
    type: "rich_text",
    title: "Returns",
    body: "Unused pieces, in their fold, can come back within fourteen days of delivery. Write in the original thread and we will tell you where to send them. Towels and robes that have been washed, and bed linen that has been slept in, cannot be taken back.\n\nIf a cloth arrives damaged, photograph it before it is washed and send the pictures in the thread the same day.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-privacy",
    pageSlug: "privacy",
    type: "rich_text",
    title: "Privacy",
    body: "When you place an order or send an inquiry, we keep your name, phone, email, address, and the message, so the house can fulfill it and so the same question is not asked twice. Visits are counted in the house book: the page, the device, the browser, and where the visit came from. Button presses are counted the same way.\n\nIf a Google Analytics measurement ID is set in the house settings, the same visits are also sent to Google. We do not sell the book. Staff who answer messages can read it. You can ask for your record to be closed by writing to the house email.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-care",
    pageSlug: "care",
    type: "rich_text",
    title: "Cloth care",
    body: "Towels: wash warm, dry low, and leave the softener in the cupboard. It coats the pile and the towel stops drinking water.\n\nPercale: wash warm and take it out while it is faintly damp if you want a smooth bed.\n\nLinen: wash cold, hang it, and let the crease stay. Ironing is optional and slightly beside the point.\n\nRobes: hang them on a wide hanger while they dry. A terry robe can go in the dryer on low. A waffle robe prefers the air.",
    visible: true,
    sort: 1,
  },
];

const testimonials: Testimonial[] = [
  { id: "tes-1", quote: "The bath towel is the first one that still felt heavy after a month of washes.", author: "Amaya F.", detail: "Signature towel, ivory", rating: 5, visible: true, sort: 1 },
  { id: "tes-2", quote: "I sent a list for the guest room. They answered with what would actually fit the bed, not a larger cart.", author: "Daniel R.", detail: "Percale and pillow pair", rating: 5, visible: true, sort: 2 },
  { id: "tes-3", quote: "The waffle robe lives on the hook. It dries by evening, which is all I asked of it.", author: "Leela S.", detail: "Waffle robe, medium", rating: 5, visible: true, sort: 3 },
  { id: "tes-4", quote: "Ordering in a thread felt strange for a minute, and then it was simply clearer than a checkout.", author: "Noah P.", detail: "Linen sheet set", rating: 4, visible: true, sort: 4 },
];

const faqs: Faq[] = [
  { id: "faq-1", question: "How do I pay?", answer: "You do not pay on this site. The order opens a WhatsApp message to the house. We reply with the total and the payment instruction, and we pack after that is settled.", visible: true, sort: 1 },
  { id: "faq-2", question: "Will I be charged the price on the page?", answer: "The page price is the cloth price. If delivery or a special size changes the total, that number is in the thread before you pay.", visible: true, sort: 2 },
  { id: "faq-3", question: "Can I ask about a piece without ordering?", answer: "Yes. Use Ask on the product page, or the contact form. The note is saved in the house book and we answer on WhatsApp.", visible: true, sort: 3 },
  { id: "faq-4", question: "Do the towels shed?", answer: "There is a little loose cotton in the first wash. After that the 700 GSM pile should hold. Skip fabric softener.", visible: true, sort: 4 },
  { id: "faq-5", question: "Are the robes sized for one body?", answer: "They are cut unisex. If you are between sizes, write your height in the order note and we will tell you which one we would send.", visible: true, sort: 5 },
  { id: "faq-6", question: "Can I change the words on the homepage?", answer: "Yes. The announcement, banners, section text, products, and policies are edited from the house book at /admin.", visible: true, sort: 6 },
];

const navigation: NavItem[] = [
  { id: "nav-1", label: "Shop", href: "/shop", location: "header", sort: 1, visible: true },
  { id: "nav-2", label: "Towels", href: "/collections/towels", location: "header", sort: 2, visible: true },
  { id: "nav-3", label: "Pillows", href: "/collections/pillows", location: "header", sort: 3, visible: true },
  { id: "nav-4", label: "Bedsheets", href: "/collections/bedsheets", location: "header", sort: 4, visible: true },
  { id: "nav-5", label: "Bath wear", href: "/collections/bath-wear", location: "header", sort: 5, visible: true },
  { id: "nav-6", label: "Our house", href: "/about", location: "header", sort: 6, visible: true },
  { id: "nav-7", label: "Towels", href: "/collections/towels", location: "footer_shop", sort: 1, visible: true },
  { id: "nav-8", label: "Pillows", href: "/collections/pillows", location: "footer_shop", sort: 2, visible: true },
  { id: "nav-9", label: "Bedsheets", href: "/collections/bedsheets", location: "footer_shop", sort: 3, visible: true },
  { id: "nav-10", label: "Bath wear", href: "/collections/bath-wear", location: "footer_shop", sort: 4, visible: true },
  { id: "nav-11", label: "All pieces", href: "/shop", location: "footer_shop", sort: 5, visible: true },
  { id: "nav-19", label: "Your orders", href: "/orders", location: "footer_help", sort: 0, visible: true },
  { id: "nav-12", label: "Questions", href: "/faq", location: "footer_help", sort: 1, visible: true },
  { id: "nav-13", label: "Shipping", href: "/pages/shipping", location: "footer_help", sort: 2, visible: true },
  { id: "nav-14", label: "Returns", href: "/pages/returns", location: "footer_help", sort: 3, visible: true },
  { id: "nav-15", label: "Cloth care", href: "/pages/care", location: "footer_help", sort: 4, visible: true },
  { id: "nav-16", label: "Our house", href: "/about", location: "footer_company", sort: 1, visible: true },
  { id: "nav-17", label: "Contact", href: "/contact", location: "footer_company", sort: 2, visible: true },
  { id: "nav-18", label: "Privacy", href: "/pages/privacy", location: "footer_company", sort: 3, visible: true },
];

function ago(days: number, hours = 10) {
  const date = new Date("2026-09-22T12:00:00.000Z");
  date.setDate(date.getDate() - days);
  date.setHours(hours, 15, 0, 0);
  return date.toISOString();
}

const orders: Order[] = [
  {
    id: "ord-1001",
    number: "CHL-1001",
    clientToken: "sample-order-1",
    customerName: "Amaya Fernando",
    phone: "+94 77 100 2201",
    email: "amaya@example.com",
    address: "18 Flower Road",
    city: "Colombo",
    notes: "Please pack the ivory bath size.",
    staffNotes: "Sample record. Confirmed in thread.",
    publicNote: "Accepted. We will confirm the delivery day in the thread.",
    items: [
      {
        productId: "prod-signature-towel",
        slug: "signature-bath-towel",
        title: "Signature Bath Towel",
        variantId: "prod-signature-towel-ivory-bath",
        variantTitle: "Ivory / Bath",
        sku: "CHL-TWL-SIG-IVORY-BATH",
        quantity: 2,
        unitPrice: 4800,
        imageUrl: ivory,
      },
    ],
    subtotal: 9600,
    status: "confirmed",
    sourcePath: "/cart",
    activities: [{ id: "act-1", at: ago(6, 11), author: "house", message: "Accepted by the house.", visible: true }],
    createdAt: ago(6),
    updatedAt: ago(6, 11),
  },
  {
    id: "ord-1002",
    number: "CHL-1002",
    clientToken: "sample-order-2",
    customerName: "Daniel Reed",
    phone: "+1 415 555 0198",
    email: "daniel@example.com",
    address: "402 Hayes Street",
    city: "San Francisco",
    notes: "Guest room. Queen.",
    staffNotes: "",
    publicNote: "",
    items: [
      {
        productId: "prod-percale",
        slug: "percale-sheet-set",
        title: "Percale Sheet Set",
        variantId: "prod-percale-ivory-queen",
        variantTitle: "Ivory / Queen",
        sku: "CHL-BED-PERC-IVORY-QUEEN",
        quantity: 1,
        unitPrice: 18900,
        imageUrl: "/images/products/percale-sheets.jpg",
      },
      {
        productId: "prod-pillow-pair",
        slug: "down-alternative-pillow-pair",
        title: "Down-Alternative Pillow Pair",
        variantId: "prod-pillow-pair-pair-medium",
        variantTitle: "Pair, medium",
        sku: "CHL-PLW-PAIR-PAIR-MEDIUM",
        quantity: 1,
        unitPrice: 8600,
        imageUrl: "/images/products/pillow-pair.jpg",
      },
    ],
    subtotal: 27500,
    status: "new",
    sourcePath: "/cart",
    activities: [],
    createdAt: ago(1, 16),
    updatedAt: ago(1, 16),
  },
];

const inquiries: Inquiry[] = [
  {
    id: "inq-1",
    type: "product",
    name: "Leela Silva",
    phone: "+94 71 555 0144",
    email: "leela@example.com",
    message: "I am between small and medium in the waffle robe. I am 168 cm.",
    productTitle: "Waffle Bath Robe",
    productSlug: "waffle-bath-robe",
    status: "in_progress",
    staffNotes: "Sample. Suggested medium.",
    pagePath: "/products/waffle-bath-robe",
    clientToken: "sample-inq-1",
    activities: [{ id: "act-2", at: ago(2, 15), author: "house", message: "Replied on WhatsApp.", visible: false }],
    createdAt: ago(2, 14),
    updatedAt: ago(2, 15),
  },
  {
    id: "inq-2",
    type: "contact",
    name: "Noah Perera",
    phone: "+44 7700 900123",
    email: "noah@example.com",
    message: "Can you quote a full guest-room set to London?",
    productTitle: "",
    productSlug: "",
    status: "new",
    staffNotes: "",
    pagePath: "/contact",
    clientToken: "sample-inq-2",
    activities: [],
    createdAt: ago(0, 9),
    updatedAt: ago(0, 9),
  },
];

const customers: Customer[] = [
  { id: "94771002201", name: "Amaya Fernando", phone: "+94 77 100 2201", email: "amaya@example.com", notes: "", orderCount: 1, inquiryCount: 0, createdAt: ago(6), lastSeenAt: ago(6) },
  { id: "14155550198", name: "Daniel Reed", phone: "+1 415 555 0198", email: "daniel@example.com", notes: "", orderCount: 1, inquiryCount: 0, createdAt: ago(1), lastSeenAt: ago(1) },
  { id: "94715550144", name: "Leela Silva", phone: "+94 71 555 0144", email: "leela@example.com", notes: "", orderCount: 0, inquiryCount: 1, createdAt: ago(2), lastSeenAt: ago(2) },
  { id: "447700900123", name: "Noah Perera", phone: "+44 7700 900123", email: "noah@example.com", notes: "", orderCount: 0, inquiryCount: 1, createdAt: ago(0), lastSeenAt: ago(0) },
];

function sampleEvents(): AnalyticsEvent[] {
  const paths = ["/", "/shop", "/collections/towels", "/collections/bedsheets", "/products/signature-bath-towel", "/products/percale-sheet-set", "/products/waffle-bath-robe", "/about", "/cart", "/contact"];
  const buttons = [
    ["Order on WhatsApp", "order-whatsapp"],
    ["Add to bag", "add-to-bag"],
    ["Shop towels", "hero-towels"],
    ["Search", "open-search"],
    ["Send inquiry", "send-inquiry"],
  ] as const;
  const devices = ["mobile", "desktop", "mobile", "desktop", "tablet"] as const;
  const browsers = ["Chrome", "Safari", "Chrome", "Instagram", "Firefox"];
  const systems = ["Android", "iOS", "Windows", "macOS", "iOS"];
  const sources = ["", "instagram.com", "google.com", "", "l.instagram.com"];
  const utm = ["", "instagram", "google", "", "instagram"];
  let seed = 91;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const events: AnalyticsEvent[] = [];
  for (let index = 0; index < 180; index += 1) {
    const day = Math.floor(next() * 14);
    const hour = 8 + Math.floor(next() * 12);
    const createdAt = ago(day, hour);
    const roll = next();
    const slot = index % devices.length;
    const type = roll < 0.62 ? "page_view" : roll < 0.82 ? "button_click" : roll < 0.9 ? "add_to_cart" : roll < 0.96 ? "whatsapp_click" : "order_submit";
    const button = buttons[index % buttons.length];
    events.push({
      id: `sample-event-${index}`,
      type,
      path: paths[Math.floor(next() * paths.length)],
      label: type === "button_click" ? button[0] : type,
      elementId: type === "button_click" ? button[1] : "",
      referrer: sources[slot] ? `https://${sources[slot]}/` : "",
      utmSource: utm[slot],
      utmMedium: utm[slot] ? "social" : "",
      utmCampaign: utm[slot] ? "house" : "",
      device: devices[slot],
      browser: browsers[slot],
      os: systems[slot],
      screen: devices[slot] === "mobile" ? "390x844" : "1440x900",
      sessionId: `sample-${1 + (index % 36)}`,
      createdAt,
    });
  }
  return events;
}

const subscribers: Subscriber[] = [
  {
    id: "sub-amaya",
    email: "amaya@example.com",
    name: "Amaya",
    status: "active",
    token: "sample-token-amaya",
    source: "footer",
    resubscribeCount: 0,
    subscribedAt: ago(8),
    unsubscribedAt: null,
    createdAt: ago(8),
  },
  {
    id: "sub-left",
    email: "left@example.com",
    name: "Nimal",
    status: "unsubscribed",
    token: "sample-token-nimal",
    source: "popup",
    resubscribeCount: 0,
    subscribedAt: ago(20),
    unsubscribedAt: ago(3),
    createdAt: ago(20),
  },
];

const campaigns: Campaign[] = [
  {
    id: "camp-draft",
    name: "The linen note",
    subject: "Washed linen is in the cupboard",
    body: "{{name}},\n\nThe sand sheet set is garment-washed and ready to pack. If a guest room is waiting, write to us on WhatsApp and name the size.\n\n{{store_name}}",
    status: "draft",
    sentCount: 0,
    failedCount: 0,
    createdAt: ago(1),
    sentAt: null,
  },
];

export function createSeed(): StoreSnapshot {
  return {
    settings,
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
    events: sampleEvents(),
    subscribers,
    campaigns,
    deliveries: [],
    templates: defaultTemplates(),
  };
}
