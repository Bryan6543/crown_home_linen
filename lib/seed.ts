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
  ProductOption,
  ProductVariant,
  Section,
  Settings,
  StoreSnapshot,
  Testimonial,
} from "@/lib/types";

// The catalogue below is Crown's real range: the items in
// "Item List for website.xlsx", priced at POS retail (Sept 2026), as entered
// on the live site on 12 Oct 2026. Prices are in cents: LKR 1,250 = 125000.
// Stock is a placeholder (20 a size); the shop only shows "In stock".
//
// Orders, inquiries, customers, subscribers, and visits further down are
// SAMPLE records. They load only into the local file store, never into the
// live database, and every one is marked as a sample.

const NOW = "2026-10-12T09:00:00.000Z";
const LKR = (rupees: number) => rupees * 100;

function cartesian(options: ProductOption[]) {
  return options.reduce<Record<string, string>[]>(
    (acc, option) => acc.flatMap((base) => option.values.map((value) => ({ ...base, [option.name]: value }))),
    [{}],
  );
}

function makeVariants(productId: string, sku: string, options: ProductOption[], priceOf: (selected: Record<string, string>) => number): ProductVariant[] {
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
      stock: 20,
    };
  });
}

type ProductInput = Omit<Product, "createdAt" | "updatedAt" | "variants" | "price" | "compareAtPrice" | "images" | "seoTitle"> & {
  prices: (selected: Record<string, string>) => number;
};

function product(input: ProductInput): Product {
  const { prices, ...rest } = input;
  const variants = makeVariants(rest.id, rest.sku, rest.options, prices);
  return {
    ...rest,
    variants,
    price: Math.min(...variants.map((variant) => variant.price)),
    compareAtPrice: null,
    images: [],
    seoTitle: rest.title,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const bySize = (table: Record<string, number>) => (selected: Record<string, string>) => LKR(table[selected.Size]);

const categories: Category[] = [
  {
    id: "cat-bedsheets",
    name: "Bedsheets",
    slug: "bedsheets",
    description: "Bed sheet sets with two pillow covers, in white or colours, from 90×90 to 100×110 inches.",
    imageUrl: "",
    imageAlt: "",
    sort: 1,
    visible: true,
  },
  {
    id: "cat-towels",
    name: "Towels",
    slug: "towels",
    description: "100% cotton bath towels in white and colours, striped pool towels, and serviettes.",
    imageUrl: "",
    imageAlt: "",
    sort: 2,
    visible: true,
  },
  {
    id: "cat-pillows",
    name: "Pillows",
    slug: "pillows",
    description: "Classic and gel pillows, cotton pillow covers, and waterproof pillow protectors.",
    imageUrl: "",
    imageAlt: "",
    sort: 3,
    visible: true,
  },
  {
    id: "cat-duvets",
    name: "Duvets & Protectors",
    slug: "duvets",
    description: "Duvets in white and colours, white duvet covers, and waterproof mattress protectors for every bed size.",
    imageUrl: "",
    imageAlt: "",
    sort: 4,
    visible: true,
  },
];

const careTowel = "Wash before first use. Machine wash warm with similar colours. Skip fabric softener: it coats the cotton and the towel absorbs less. Tumble dry low or line dry.";
const careSheet = "Machine wash warm. Wash colours separately the first few times. Tumble dry low or line dry, and take the sheets in while faintly damp for an easier iron.";
const careProtector = "Machine wash warm, not hot. Do not iron, bleach, or dry-clean: heat damages the waterproof layer. Line dry or tumble dry on low.";

const products: Product[] = [
  product({
    id: "crown-bss-white",
    title: "Bed Sheet Set — White",
    slug: "bed-sheet-set-white",
    shortDescription: "A white bed sheet with two pillow covers. The hotel standard, in three sizes.",
    description:
      "One white bed sheet and two matching pillow covers, sold as a set. White is what hotels, guest houses, and most homes come back to: it goes with everything and it shows that the bed is clean.\n\nChoose the sheet size in inches. If you are not sure which fits, send us your mattress size on WhatsApp and we will tell you.",
    sku: "CR-BSS-WHT",
    categoryId: "cat-bedsheets",
    options: [{ name: "Size", values: ["90×90", "90×100", "100×110"] }],
    prices: bySize({ "90×90": 1600, "90×100": 1900, "100×110": 2400 }),
    material: "White bed sheet with two pillow covers",
    care: careSheet,
    dimensions: "Sheet 90×90 in (229×229 cm), 90×100 in (229×254 cm), or 100×110 in (254×279 cm). Two pillow covers included.",
    featured: true,
    bestseller: true,
    status: "active",
    seoDescription: "White bed sheet set with two pillow covers in 90×90, 90×100, and 100×110 inches, from Crown, Colombo 11. Order on WhatsApp.",
    sort: 1,
  }),
  product({
    id: "crown-bss-colours",
    title: "Bed Sheet Set — Colours",
    slug: "bed-sheet-set-colours",
    shortDescription: "A bed sheet with two pillow covers, in mixed colours. Three sizes.",
    description:
      "One bed sheet and two pillow covers in the same colour, sold as a set. Colours change with each shipment, so tell us the colour you would like in the order note or ask on WhatsApp what is on the shelf this week.\n\nSizes are in inches, from 90×90 to 100×110.",
    sku: "CR-BSS-COL",
    categoryId: "cat-bedsheets",
    options: [{ name: "Size", values: ["90×90", "90×100", "100×110"] }],
    prices: bySize({ "90×90": 1400, "90×100": 1900, "100×110": 2350 }),
    material: "Coloured bed sheet with two pillow covers",
    care: careSheet,
    dimensions: "Sheet 90×90 in (229×229 cm), 90×100 in (229×254 cm), or 100×110 in (254×279 cm). Two pillow covers included.",
    featured: true,
    bestseller: true,
    status: "active",
    seoDescription: "Coloured bed sheet set with two pillow covers, 90×90 to 100×110 inches, from Crown, Colombo 11. Order on WhatsApp.",
    sort: 2,
  }),
  product({
    id: "crown-white-towel",
    title: "White Bath Towel",
    slug: "white-bath-towel",
    shortDescription: "Plain white 100% cotton towels in three sizes.",
    description:
      "A plain white 100% cotton towel. The smallest size is a hand towel, the largest a full bath towel. White can be washed warm and bleached when it needs to be, which is why guest houses and salons buy it by the dozen.",
    sku: "CR-TWL-WHT",
    categoryId: "cat-towels",
    options: [{ name: "Size", values: ["20×40", "27×54", "30×60"] }],
    prices: bySize({ "20×40": 700, "27×54": 1000, "30×60": 1200 }),
    material: "100% cotton",
    care: careTowel,
    dimensions: "20×40 in (51×102 cm), 27×54 in (69×137 cm), or 30×60 in (76×152 cm).",
    featured: true,
    bestseller: true,
    status: "active",
    seoDescription: "Plain white 100% cotton bath towels in 20×40, 27×54, and 30×60 inches, from Crown, Colombo 11.",
    sort: 3,
  }),
  product({
    id: "crown-colour-towel",
    title: "Colour Bath Towel",
    slug: "colour-bath-towel",
    shortDescription: "Plain-colour 100% cotton towels for everyday use. Mixed colours, three sizes.",
    description:
      "An everyday 100% cotton towel in plain colours. Colours vary with stock: name the colour you want in the order note, or ask on WhatsApp what is in today. Good value for the home, and easy to match across a bathroom.",
    sku: "CR-TWL-COL",
    categoryId: "cat-towels",
    options: [{ name: "Size", values: ["20×40", "27×54", "30×60"] }],
    prices: bySize({ "20×40": 650, "27×54": 950, "30×60": 1250 }),
    material: "100% cotton",
    care: careTowel,
    dimensions: "20×40 in (51×102 cm), 27×54 in (69×137 cm), or 30×60 in (76×152 cm).",
    featured: true,
    bestseller: false,
    status: "active",
    seoDescription: "Plain-colour 100% cotton bath towels in three sizes, from Crown, Colombo 11. Order on WhatsApp.",
    sort: 4,
  }),
  product({
    id: "crown-pool-towel",
    title: "Pool Towel",
    slug: "pool-towel",
    shortDescription: "A large 36×72 striped towel, in blue and white or brown and white.",
    description: "A long striped towel for the pool, the beach, or a sun lounger. Large enough to lie on: 36×72 inches. Two stripes to choose from.",
    sku: "CR-TWL-POOL",
    categoryId: "cat-towels",
    options: [{ name: "Colour", values: ["Blue & White", "Brown & White"] }],
    prices: () => LKR(1300),
    material: "Cotton",
    care: careTowel,
    dimensions: "36×72 in (91×183 cm).",
    featured: true,
    bestseller: false,
    status: "active",
    seoDescription: "Large 36×72 inch striped pool towel in blue and white or brown and white, from Crown, Colombo 11.",
    sort: 5,
  }),
  product({
    id: "crown-serviette",
    title: "Serviette",
    slug: "serviette",
    shortDescription: "Large cotton serviettes in mixed colours.",
    description: "A large cotton serviette for the face, the kitchen, or the counter. Sold one at a time in mixed colours; ask on WhatsApp for a dozen.",
    sku: "CR-SRV-L",
    categoryId: "cat-towels",
    options: [{ name: "Size", values: ["Large"] }],
    prices: () => LKR(650),
    material: "Cotton",
    care: careTowel,
    dimensions: "Large.",
    featured: false,
    bestseller: false,
    status: "active",
    seoDescription: "Large cotton serviettes in mixed colours, from Crown, Colombo 11.",
    sort: 6,
  }),
  product({
    id: "crown-classic-pillow",
    title: "Classic Pillow",
    slug: "classic-pillow",
    shortDescription: "Our everyday pillow, in two sizes.",
    description: "The pillow most of our customers buy: soft, full, and the right height for most sleepers. The 18×27 size fits a standard pillow cover; the 16×22 is the smaller size for children and narrow beds.",
    sku: "CR-PIL-CLS",
    categoryId: "cat-pillows",
    options: [{ name: "Size", values: ["16×22", "18×27"] }],
    prices: bySize({ "16×22": 750, "18×27": 950 }),
    material: "Fibre-filled pillow",
    care: "Use with a pillow cover, and a waterproof protector if you want it to last. Air in the sun now and then and plump it daily.",
    dimensions: "16×22 in (41×56 cm) or 18×27 in (46×69 cm).",
    featured: true,
    bestseller: true,
    status: "active",
    seoDescription: "Classic pillow in 16×22 and 18×27 inches, from Crown, Colombo 11. Order on WhatsApp.",
    sort: 7,
  }),
  product({
    id: "crown-gel-pillow",
    title: "Gel Pillow",
    slug: "gel-pillow",
    shortDescription: "An 18×27 pillow with a gel fill and a cotton cover.",
    description: "A gel-filled pillow with a cotton cover. It holds its shape through the night and stays cooler than a fibre pillow, which helps on warm Colombo nights.",
    sku: "CR-PIL-GEL",
    categoryId: "cat-pillows",
    options: [{ name: "Size", values: ["18×27"] }],
    prices: () => LKR(2500),
    material: "Cotton cover, gel fill",
    care: "Use with a pillow cover. Spot clean the cover; do not machine wash the pillow.",
    dimensions: "18×27 in (46×69 cm).",
    featured: false,
    bestseller: false,
    status: "active",
    seoDescription: "Gel pillow with a cotton cover, 18×27 inches, from Crown, Colombo 11.",
    sort: 8,
  }),
  product({
    id: "crown-pillow-cover",
    title: "Pillow Cover",
    slug: "pillow-cover",
    shortDescription: "100% cotton pillow covers in mixed colours, 18×27.",
    description: "A plain 100% cotton pillow cover for an 18×27 pillow. Sold one at a time in mixed colours, so you can add a spare to any bed sheet set.",
    sku: "CR-PCV-COL",
    categoryId: "cat-pillows",
    options: [{ name: "Size", values: ["18×27"] }],
    prices: () => LKR(475),
    material: "100% cotton, mixed colours",
    care: careSheet,
    dimensions: "Fits an 18×27 in (46×69 cm) pillow.",
    featured: false,
    bestseller: false,
    status: "active",
    seoDescription: "100% cotton pillow cover for 18×27 inch pillows, mixed colours, from Crown, Colombo 11.",
    sort: 9,
  }),
  product({
    id: "crown-pillow-protector",
    title: "Waterproof Pillow Protector",
    slug: "waterproof-pillow-protector",
    shortDescription: "A white waterproof protector that goes under the pillow cover.",
    description: "A white waterproof protector that zips or slips over the pillow, under the cover. It keeps sweat, spills, and hair oil out of the pillow, so the pillow lasts years longer.",
    sku: "CR-PPR-WP",
    categoryId: "cat-pillows",
    options: [{ name: "Size", values: ["18×27", "20×30"] }],
    prices: bySize({ "18×27": 950, "20×30": 1250 }),
    material: "Waterproof, white",
    care: careProtector,
    dimensions: "18×27 in (46×69 cm) or 20×30 in (51×76 cm).",
    featured: false,
    bestseller: false,
    status: "active",
    seoDescription: "White waterproof pillow protector in 18×27 and 20×30 inches, from Crown, Colombo 11.",
    sort: 10,
  }),
  product({
    id: "crown-mattress-protector",
    title: "Waterproof Mattress Protector",
    slug: "waterproof-mattress-protector",
    shortDescription: "A white waterproof cover that keeps the mattress clean, in four bed sizes.",
    description:
      "A white waterproof protector that fits over the mattress, under the bed sheet. It stops spills, sweat, and accidents reaching the mattress, which matters for children's beds, guest rooms, and every hotel bed.\n\nChoose the size of your mattress in inches.",
    sku: "CR-MPR-WP",
    categoryId: "cat-duvets",
    options: [{ name: "Size", values: ["36×72", "48×72", "60×72", "72×78"] }],
    prices: bySize({ "36×72": 2800, "48×72": 3200, "60×72": 5000, "72×78": 6400 }),
    material: "Waterproof, white",
    care: careProtector,
    dimensions: "For mattresses of 36×72 in (91×183 cm), 48×72 in (122×183 cm), 60×72 in (152×183 cm), or 72×78 in (183×198 cm).",
    featured: true,
    bestseller: false,
    status: "active",
    seoDescription: "White waterproof mattress protector for 36×72, 48×72, 60×72, and 72×78 inch mattresses, from Crown, Colombo 11.",
    sort: 11,
  }),
  product({
    id: "crown-duvet",
    title: "Duvet",
    slug: "duvet",
    shortDescription: "A soft duvet in white or colours, in four sizes.",
    description: "A soft, light duvet for air-conditioned rooms and cool hill-country nights. White suits a hotel room and takes a duvet cover; colours can be used on their own.",
    sku: "CR-DUV",
    categoryId: "cat-duvets",
    options: [
      { name: "Colour", values: ["White", "Mixed colours"] },
      { name: "Size", values: ["60×90", "72×90", "90×90", "90×100"] },
    ],
    prices: bySize({ "60×90": 4600, "72×90": 5500, "90×90": 6500, "90×100": 7500 }),
    material: "Duvet",
    care: "Air it in the sun regularly. Wash on a gentle cycle in a large machine or have it laundered, and dry it completely before use.",
    dimensions: "60×90 in (152×229 cm), 72×90 in (183×229 cm), 90×90 in (229×229 cm), or 90×100 in (229×254 cm).",
    featured: true,
    bestseller: true,
    status: "active",
    seoDescription: "Duvet in white or colours, 60×90 to 90×100 inches, from Crown, Colombo 11. Order on WhatsApp.",
    sort: 12,
  }),
  product({
    id: "crown-duvet-cover",
    title: "Duvet Cover",
    slug: "duvet-cover",
    shortDescription: "A white duvet cover in four sizes.",
    description: "A white duvet cover that keeps the duvet clean and is easy to wash. Sizes match our duvets, from 60×90 to 90×100 inches.",
    sku: "CR-DCV-WHT",
    categoryId: "cat-duvets",
    options: [{ name: "Size", values: ["60×90", "72×90", "90×90", "90×100"] }],
    prices: bySize({ "60×90": 4500, "72×90": 5500, "90×90": 6500, "90×100": 7250 }),
    material: "White",
    care: careSheet,
    dimensions: "60×90 in (152×229 cm), 72×90 in (183×229 cm), 90×90 in (229×229 cm), or 90×100 in (229×254 cm).",
    featured: false,
    bestseller: false,
    status: "active",
    seoDescription: "White duvet cover in 60×90, 72×90, 90×90, and 90×100 inches, from Crown, Colombo 11.",
    sort: 13,
  }),
];

const settings: Settings = {
  storeName: "Crown",
  logoUrl: "",
  tagline: "Bedsheets and towels from Colombo 11, for 25 years.",
  // Off by default: switch it on in Settings when there is real news.
  announcement: "New colours in bed sheet sets this week. Ask on WhatsApp what is in stock.",
  announcementEnabled: false,
  whatsappNumber: "94741754141",
  whatsappGreeting: "Hello Crown, I would like to ask about an item.",
  email: "",
  phoneDisplay: "074 175 4141",
  address: "No. 07, 3rd Cross Street",
  city: "Colombo 11",
  hours: "",
  instagram: "https://instagram.com/crownbedsheets",
  currency: "LKR",
  gaMeasurementId: "",
  footerNote:
    "Importers and wholesale dealers in textiles. Specialists in bedsheets and towels for 25 years. Retail and wholesale orders on WhatsApp.",
  metaTitle: "Crown — Bedsheets, towels, pillows and duvets in Colombo",
  metaDescription:
    "Crown, Colombo 11: importers and wholesale dealers in textiles for 25 years. Bed sheet sets, towels, pillows, duvets, and waterproof protectors. Retail and wholesale, ordered on WhatsApp.",
  emailFrom: "Crown <hello@crownhomelinen.com>",
  popupEnabled: true,
  popupTitle: "New stock, now and then",
  popupBody: "New stock and the occasional note from Crown. Leave an email, and leave whenever you like.",
  sceneEnabled: false,
  sceneAssetUrl: "",
  sceneYaw: 0,
  sceneCaption: "",
};

const banners: Banner[] = [
  {
    id: "ban-crown",
    placement: "hero",
    eyebrow: "Crown · 25 years in Colombo 11",
    title: "Specialists in bedsheets and towels",
    subtitle: "Importers and wholesale dealers in textiles. Bed sheet sets, towels, pillows, and duvets at retail prices here, and wholesale on WhatsApp.",
    imageUrl: "/images/heroes/bed.jpg",
    imageAlt: "A bed made with white sheets and pillows in morning light",
    buttonLabel: "Shop the range",
    buttonHref: "/shop",
    align: "left",
    tone: "dark",
    active: true,
    sort: 1,
  },
  {
    id: "ban-sheets",
    placement: "hero",
    eyebrow: "Bedsheets",
    title: "Sheet sets, white or colour",
    subtitle: "A bed sheet and two pillow covers, from 90×90 to 100×110 inches.",
    imageUrl: "/images/categories/bedsheets.jpg",
    imageAlt: "A bed dressed in white sheets",
    buttonLabel: "Shop bedsheets",
    buttonHref: "/collections/bedsheets",
    align: "left",
    tone: "dark",
    active: false,
    sort: 3,
  },
  {
    id: "ban-towels",
    placement: "hero",
    eyebrow: "Towels",
    title: "100% cotton towels",
    subtitle: "White and colours in three sizes, pool towels, and serviettes.",
    imageUrl: "/images/heroes/bath.jpg",
    imageAlt: "Folded towels on a stone bathroom shelf",
    buttonLabel: "Shop towels",
    buttonHref: "/collections/towels",
    align: "left",
    tone: "dark",
    active: true,
    sort: 2,
  },
];

const pages: CmsPage[] = [
  { slug: "home", title: "Home", seoTitle: settings.metaTitle, seoDescription: settings.metaDescription, published: true, kind: "home" },
  { slug: "shop", title: "Shop", seoTitle: "Shop all items", seoDescription: "Bed sheet sets, towels, pillows, duvets, and waterproof protectors at Crown's retail prices in LKR. Wholesale on WhatsApp.", published: true, kind: "system" },
  { slug: "about", title: "About Crown", seoTitle: "About Crown", seoDescription: "Crown: importers and wholesale dealers in textiles at No. 07, 3rd Cross Street, Colombo 11, specialising in bedsheets and towels for 25 years.", published: true, kind: "system" },
  { slug: "contact", title: "Contact", seoTitle: "Contact Crown", seoDescription: "Message Crown on WhatsApp at 074 175 4141, or visit No. 07, 3rd Cross Street, Colombo 11.", published: true, kind: "system" },
  { slug: "faq", title: "Questions", seoTitle: "Questions", seoDescription: "How to order and pay, wholesale, sizes, delivery, and visiting the Crown shop in Colombo 11.", published: true, kind: "system" },
  { slug: "wholesale", title: "Wholesale", seoTitle: "Wholesale bed linen and towels", seoDescription: "Wholesale bed sheets, towels, pillows, duvets, and protectors for hotels, guest houses, and shops, from Crown, Colombo 11. Send your list for a quote.", published: true, kind: "system" },
  { slug: "size-guide", title: "Size guide", seoTitle: "Size guide", seoDescription: "Crown's bed sheet, duvet, mattress protector, pillow, and towel sizes in inches and centimetres.", published: true, kind: "page" },
  { slug: "shipping", title: "Delivery", seoTitle: "Delivery", seoDescription: "How Crown delivers an order after it is confirmed on WhatsApp.", published: true, kind: "page" },
  { slug: "returns", title: "Returns", seoTitle: "Returns and exchanges", seoDescription: "What to do if an item from Crown arrives damaged or is not what you ordered.", published: true, kind: "page" },
  { slug: "privacy", title: "Privacy", seoTitle: "Privacy", seoDescription: "What Crown keeps when you place an order, send a question, or join the letter list.", published: true, kind: "page" },
  { slug: "care", title: "Linen care", seoTitle: "Linen care", seoDescription: "How to wash towels, bed sheets, duvets, and waterproof protectors so they last.", published: true, kind: "page" },
];

const highlights = [
  { title: "25 years in the trade", text: "Importers and wholesale dealers on 3rd Cross Street, Colombo 11." },
  { title: "Retail and wholesale", text: "One towel or a hotel's worth. Bulk prices quoted on WhatsApp." },
  { title: "Every common size", text: "Sheets 90×90 to 100×110. Protectors 36×72 to 72×78." },
  { title: "Price confirmed first", text: "We confirm the total on WhatsApp before you pay anything." },
];

const orderSteps = [
  { title: "Choose", text: "Add the sizes and colours you need to the bag. Prices are Crown's retail prices in LKR." },
  { title: "Send on WhatsApp", text: "Your order is saved with an order number and opens as a WhatsApp message to 074 175 4141." },
  { title: "We confirm", text: "A person at Crown replies with availability, delivery, and the final total." },
  { title: "Pay and receive", text: "You pay only after confirming. Delivery or collection is arranged in the same chat." },
];

const wholesale = {
  eyebrow: "Wholesale · Hotels · Guest houses · Shops",
  title: "Buying for a hotel, guest house, or shop?",
  body: "Crown has been an importer and wholesale dealer in textiles for 25 years. Send us your list, with items, sizes, and quantities, and we will reply on WhatsApp with wholesale prices and what is in stock.",
  items: [
    { title: "Bulk prices", text: "Wholesale rates on quantity, quoted per order." },
    { title: "Hotel bed linen", text: "White sheet sets, duvets, covers, and protectors in standard sizes." },
    { title: "One quote", text: "Mix sheets, towels, and pillows in a single list." },
    { title: "Repeat orders", text: "Send the same list again whenever you restock." },
  ],
};

const sections: Section[] = [
  { id: "sec-home-hero", pageSlug: "home", type: "hero", visible: true, sort: 1 },
  { id: "sec-home-highlights", pageSlug: "home", type: "highlights", title: "Why Crown", items: highlights, visible: true, sort: 2 },
  { id: "sec-home-cats", pageSlug: "home", type: "categories", title: "Shop by category", subtitle: "Bed linen, towels, and pillows: the things Crown has specialised in for 25 years.", visible: true, sort: 3 },
  { id: "sec-home-featured", pageSlug: "home", type: "product_grid", title: "Our main lines", subtitle: "The items customers come to Crown for.", source: "featured", limit: 8, visible: true, sort: 4 },
  { id: "sec-home-steps", pageSlug: "home", type: "steps", title: "How ordering works", subtitle: "No card details and no account. A person at Crown confirms every order.", items: orderSteps, visible: true, sort: 5 },
  { id: "sec-home-wholesale", pageSlug: "home", type: "wholesale", ...wholesale, visible: true, sort: 6 },
  { id: "sec-home-sizes", pageSlug: "home", type: "size_guide", title: "Find the right size", subtitle: "All sizes are in inches. Measure the mattress, or send us its size on WhatsApp and we will match it.", visible: true, sort: 7 },
  {
    id: "sec-home-story",
    pageSlug: "home",
    type: "image_text",
    eyebrow: "About Crown",
    title: "25 years on 3rd Cross Street",
    body: "Crown is an importer and wholesale dealer in textiles at No. 07, 3rd Cross Street, Colombo 11. For 25 years we have specialised in bedsheets and towels, for homes, shops, guest houses, and hotels.\n\nThis website shows our main lines at retail prices. Every order still goes through a person: you send it on WhatsApp, we confirm it, and then it is packed.",
    imageUrl: "/images/editorial/still-life.jpg",
    imageAlt: "Folded towels stacked on a stone counter",
    buttonLabel: "About Crown",
    buttonHref: "/about",
    align: "right",
    visible: true,
    sort: 8,
  },
  { id: "sec-home-visit", pageSlug: "home", type: "visit", title: "Visit the shop", subtitle: "See the stock and feel the cloth before you buy. Message us first if you would like something kept aside.", visible: true, sort: 9 },
  { id: "sec-home-note", pageSlug: "home", type: "newsletter", title: "New stock, now and then", subtitle: "Leave an email and we will write when new lines or colours arrive. Leave the list whenever you like.", buttonLabel: "Join the list", visible: true, sort: 10 },

  { id: "sec-shop-intro", pageSlug: "shop", type: "rich_text", title: "Everything at Crown", body: "Retail prices in LKR. Choose sizes and colours, then send the bag on WhatsApp and we confirm the total before you pay. Buying in quantity? Ask for a wholesale quote.", visible: true, sort: 1 },

  {
    id: "sec-about-1",
    pageSlug: "about",
    type: "image_text",
    eyebrow: "About Crown",
    title: "25 years in Colombo 11",
    body: "Crown is an importer and wholesale dealer in textiles, specialising in bedsheets and towels. For 25 years the shop at No. 07, 3rd Cross Street, Colombo 11 has supplied homes, shops, guest houses, and hotels.\n\nWe keep the sizes people actually need, from a 20×40 hand towel to a 100×110 sheet set and a 72×78 mattress protector, and we sell them both by the piece and in bulk.",
    imageUrl: "/images/editorial/about.jpg",
    imageAlt: "Folded towels and linen on a stone counter",
    buttonLabel: "Shop the range",
    buttonHref: "/shop",
    align: "left",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-about-2",
    pageSlug: "about",
    type: "image_text",
    eyebrow: "How we sell",
    title: "You message. We confirm. Then it is packed.",
    body: "There is no card checkout on this site. Add items to the bag and send the order on WhatsApp to 074 175 4141. We reply with availability, delivery, and the total, and nothing is packed until you have agreed it.\n\nQuestions and wholesale lists come to the same place, so nothing gets lost.",
    imageUrl: "/images/heroes/bed.jpg",
    imageAlt: "A bed made with white sheets",
    buttonLabel: "Message Crown",
    buttonHref: "/contact",
    align: "right",
    visible: true,
    sort: 2,
  },
  {
    id: "sec-about-values",
    pageSlug: "about",
    type: "values",
    title: "What you can expect",
    items: [
      { title: "Every common size", text: "Sheets, duvets, and protectors for every common bed size, and towels from hand to bath." },
      { title: "Retail and wholesale", text: "The same stock for a single bed or a whole guest house." },
      { title: "Price confirmed first", text: "We state the total on WhatsApp before you pay." },
      { title: "A real shop", text: "Visit us at No. 07, 3rd Cross Street, Colombo 11." },
    ],
    visible: true,
    sort: 3,
  },
  { id: "sec-about-visit", pageSlug: "about", type: "visit", title: "Visit the shop", subtitle: "Come and see the stock. Message us first if you would like something kept aside.", visible: true, sort: 4 },

  { id: "sec-contact", pageSlug: "contact", type: "contact", title: "Message Crown", subtitle: "Send a question, an order, or a wholesale list. It is saved with us and opens in WhatsApp, so the reply comes to your phone.", visible: true, sort: 1 },

  { id: "sec-faq", pageSlug: "faq", type: "faq", title: "Questions", subtitle: "If the answer is not here, message us on WhatsApp.", visible: true, sort: 1 },

  { id: "sec-wholesale", pageSlug: "wholesale", type: "wholesale", ...wholesale, visible: true, sort: 1 },
  { id: "sec-wholesale-steps", pageSlug: "wholesale", type: "steps", title: "How a wholesale order works", subtitle: "", items: [
    { title: "Send your list", text: "Items, sizes, colours, and quantities. A photo of a handwritten list is fine." },
    { title: "Get a quote", text: "We reply on WhatsApp with wholesale prices and what is in stock now." },
    { title: "Confirm", text: "Agree the quote, then payment and delivery or collection." },
  ], visible: true, sort: 2 },
  { id: "sec-wholesale-sizes", pageSlug: "wholesale", type: "size_guide", title: "Sizes we stock", subtitle: "All sizes in inches.", visible: true, sort: 3 },

  { id: "sec-size-guide", pageSlug: "size-guide", type: "size_guide", title: "Size guide", subtitle: "Every size Crown sells, in inches with centimetres alongside. Not sure? Send us your mattress size on WhatsApp and we will match it.", visible: true, sort: 1 },

  {
    id: "sec-shipping",
    pageSlug: "shipping",
    type: "rich_text",
    title: "Delivery",
    body: "Delivery is arranged on WhatsApp after your order is confirmed. We tell you the delivery cost and the expected day before you pay, because both depend on where the order is going and how much it weighs.\n\nYou can also collect from the shop at No. 07, 3rd Cross Street, Colombo 11. Message us first so the order is packed and waiting.\n\nFor wholesale orders, delivery is quoted with the order.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-returns",
    pageSlug: "returns",
    type: "rich_text",
    title: "Returns and exchanges",
    body: "Please check your order when it arrives. If something is damaged, the wrong size, or not what you ordered, message us on WhatsApp straight away with your order number and a photo, before the item is used or washed. We will arrange an exchange or put it right.\n\nFor hygiene reasons we cannot take back pillows, protectors, or bed linen that have been used.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-privacy",
    pageSlug: "privacy",
    type: "rich_text",
    title: "Privacy",
    body: "When you place an order or send a question, Crown keeps your name, phone number, email if you give one, delivery address, and your message, so we can reply and deliver. Staff who answer messages can read these records. We do not sell or share them.\n\nThe site counts visits: the page, the type of device and browser, and the site you came from. It does not use this to identify you. If Google Analytics is switched on, the same visit counts are also sent to Google.\n\nIf you join the letter list, we keep your email until you leave it. Every letter has a link to leave. To have your records removed, message us on WhatsApp at 074 175 4141.",
    visible: true,
    sort: 1,
  },
  {
    id: "sec-care",
    pageSlug: "care",
    type: "rich_text",
    title: "Linen care",
    body: "Towels: wash before first use to remove loose fibres. Wash warm with similar colours and skip fabric softener: it coats the cotton and the towel absorbs less. White towels can be bleached occasionally.\n\nBed sheets and pillow covers: wash warm, and wash coloured sets separately the first few times. Take them off the line or out of the dryer while faintly damp for an easier iron.\n\nDuvets: air them in the sun regularly. Wash on a gentle cycle in a large machine, or have them laundered, and dry completely before use. A duvet cover keeps washing to a minimum.\n\nWaterproof protectors: wash warm, not hot. Do not iron, bleach, or dry-clean them, because heat damages the waterproof layer. Line dry, or tumble dry on low.",
    visible: true,
    sort: 1,
  },
];

// No customer reviews yet. Real ones can be added in the house book under Notes.
const testimonials: Testimonial[] = [];

const faqs: Faq[] = [
  { id: "faq-pay", question: "How do I pay?", answer: "You do not pay on this website. Send your order on WhatsApp; we confirm availability and the total, then tell you how to pay. Nothing is packed until you have agreed the total.", visible: true, sort: 1 },
  { id: "faq-price", question: "Will I be charged the price on the page?", answer: "The page shows Crown's retail price for each size. Delivery, if you need it, and any wholesale price for larger quantities are confirmed on WhatsApp before you pay.", visible: true, sort: 2 },
  { id: "faq-wholesale", question: "Do you sell wholesale?", answer: "Yes. Crown is an importer and wholesale dealer. Shops, hotels, and guest houses can send a list with items, sizes, and quantities from the Wholesale page or on WhatsApp, and we reply with wholesale prices.", visible: true, sort: 3 },
  { id: "faq-size", question: "Which bed sheet size do I need?", answer: "Each set is a bed sheet with two pillow covers. Sheet sizes are 90×90, 90×100, and 100×110 inches. The size guide lists every size in inches and centimetres. If you are unsure, send us your mattress size on WhatsApp and we will tell you which set fits.", visible: true, sort: 4 },
  { id: "faq-colours", question: "Can I choose the colour?", answer: "Coloured towels, sheet sets, pillow covers, and duvets come in mixed colours that change with each shipment. Write the colour you would like in the order note, or ask on WhatsApp what is in stock today.", visible: true, sort: 5 },
  { id: "faq-delivery", question: "Do you deliver?", answer: "Delivery is arranged on WhatsApp once your order is confirmed. We tell you the cost and the day before you pay. You can also collect from the shop.", visible: true, sort: 6 },
  { id: "faq-ask", question: "Can I ask about an item without ordering?", answer: "Yes. Use Ask about this item on any product page, the contact form, or message 074 175 4141 on WhatsApp.", visible: true, sort: 7 },
  { id: "faq-track", question: "How do I check on my order?", answer: "Open Your orders and enter the order number (it starts with CHL-) and the phone number you used. You will see where the order is, from received to delivered.", visible: true, sort: 8 },
  { id: "faq-visit", question: "Can I visit the shop?", answer: "Yes. Crown is at No. 07, 3rd Cross Street, Colombo 11. Message us first if you would like something kept aside.", visible: true, sort: 9 },
];

const navigation: NavItem[] = [
  { id: "nav-shop", label: "Shop all", href: "/shop", location: "header", sort: 1, visible: true },
  { id: "nav-bedsheets", label: "Bedsheets", href: "/collections/bedsheets", location: "header", sort: 2, visible: true },
  { id: "nav-towels", label: "Towels", href: "/collections/towels", location: "header", sort: 3, visible: true },
  { id: "nav-pillows", label: "Pillows", href: "/collections/pillows", location: "header", sort: 4, visible: true },
  { id: "nav-duvets", label: "Duvets", href: "/collections/duvets", location: "header", sort: 5, visible: true },
  { id: "nav-wholesale", label: "Wholesale", href: "/wholesale", location: "header", sort: 6, visible: true },
  { id: "nav-about", label: "About", href: "/about", location: "header", sort: 7, visible: true },

  { id: "nav-f-bedsheets", label: "Bedsheets", href: "/collections/bedsheets", location: "footer_shop", sort: 1, visible: true },
  { id: "nav-f-towels", label: "Towels", href: "/collections/towels", location: "footer_shop", sort: 2, visible: true },
  { id: "nav-f-pillows", label: "Pillows", href: "/collections/pillows", location: "footer_shop", sort: 3, visible: true },
  { id: "nav-f-duvets", label: "Duvets & protectors", href: "/collections/duvets", location: "footer_shop", sort: 4, visible: true },
  { id: "nav-f-all", label: "All items", href: "/shop", location: "footer_shop", sort: 5, visible: true },

  { id: "nav-f-orders", label: "Your orders", href: "/orders", location: "footer_help", sort: 1, visible: true },
  { id: "nav-f-faq", label: "Questions", href: "/faq", location: "footer_help", sort: 2, visible: true },
  { id: "nav-f-sizes", label: "Size guide", href: "/pages/size-guide", location: "footer_help", sort: 3, visible: true },
  { id: "nav-f-delivery", label: "Delivery", href: "/pages/shipping", location: "footer_help", sort: 4, visible: true },
  { id: "nav-f-returns", label: "Returns", href: "/pages/returns", location: "footer_help", sort: 5, visible: true },
  { id: "nav-f-care", label: "Linen care", href: "/pages/care", location: "footer_help", sort: 6, visible: true },

  { id: "nav-f-about", label: "About Crown", href: "/about", location: "footer_company", sort: 1, visible: true },
  { id: "nav-f-wholesale", label: "Wholesale", href: "/wholesale", location: "footer_company", sort: 2, visible: true },
  { id: "nav-f-contact", label: "Contact", href: "/contact", location: "footer_company", sort: 3, visible: true },
  { id: "nav-f-privacy", label: "Privacy", href: "/pages/privacy", location: "footer_company", sort: 4, visible: true },
];

// ---------------------------------------------------------------------------
// SAMPLE records for the local house book. Not real customers.
// ---------------------------------------------------------------------------

function ago(days: number, hours = 10) {
  const date = new Date("2026-10-12T12:00:00.000Z");
  date.setDate(date.getDate() - days);
  date.setHours(hours, 15, 0, 0);
  return date.toISOString();
}

function line(productId: string, size: Record<string, string>, quantity: number) {
  const item = products.find((entry) => entry.id === productId)!;
  const variant = item.variants.find((entry) => Object.entries(size).every(([key, value]) => entry.options[key] === value))!;
  return {
    productId: item.id,
    slug: item.slug,
    title: item.title,
    variantId: variant.id,
    variantTitle: variant.title,
    sku: variant.sku,
    quantity,
    unitPrice: variant.price,
    imageUrl: "",
  };
}

function sampleOrder(input: Omit<Order, "subtotal" | "clientToken" | "sourcePath" | "updatedAt" | "staffNotes"> & { staffNotes?: string }): Order {
  return {
    ...input,
    clientToken: `sample-${input.id}`,
    sourcePath: "/cart",
    staffNotes: input.staffNotes ?? "SAMPLE record for the demo book. Not a real customer.",
    subtotal: input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    updatedAt: input.activities[0]?.at ?? input.createdAt,
  };
}

const orders: Order[] = [
  sampleOrder({
    id: "ord-sample-1",
    number: "CHL-1001",
    customerName: "Sample — Home order",
    phone: "077 000 0001",
    email: "",
    address: "12 Sample Lane",
    city: "Dehiwala",
    notes: "Blue if you have it for the coloured set.",
    publicNote: "Delivered. Thank you.",
    items: [line("crown-bss-colours", { Size: "90×100" }, 2), line("crown-classic-pillow", { Size: "18×27" }, 2)],
    status: "fulfilled",
    activities: [
      { id: "act-s1c", at: ago(4, 15), author: "house", message: "Status set to Delivered.", visible: true },
      { id: "act-s1b", at: ago(6, 11), author: "house", message: "Status set to Confirmed.", visible: true },
      { id: "act-s1a", at: ago(7, 10), author: "house", message: "Order received.", visible: true },
    ],
    createdAt: ago(7),
  }),
  sampleOrder({
    id: "ord-sample-2",
    number: "CHL-1002",
    customerName: "Sample — Guest house",
    phone: "077 000 0002",
    email: "",
    address: "Sample Road",
    city: "Kandy",
    notes: "Six rooms. Please confirm delivery cost to Kandy.",
    publicNote: "Packed. Courier details sent on WhatsApp.",
    items: [
      line("crown-bss-white", { Size: "100×110" }, 6),
      line("crown-mattress-protector", { Size: "72×78" }, 6),
      line("crown-white-towel", { Size: "30×60" }, 12),
    ],
    status: "packed",
    activities: [
      { id: "act-s2b", at: ago(1, 14), author: "house", message: "Status set to Packed.", visible: true },
      { id: "act-s2a", at: ago(2, 9), author: "house", message: "Order received.", visible: true },
    ],
    createdAt: ago(2, 9),
  }),
  sampleOrder({
    id: "ord-sample-3",
    number: "CHL-1003",
    customerName: "Sample — New order",
    phone: "077 000 0003",
    email: "",
    address: "45 Sample Mawatha",
    city: "Colombo 05",
    notes: "",
    publicNote: "",
    items: [line("crown-duvet", { Colour: "White", Size: "90×100" }, 1), line("crown-duvet-cover", { Size: "90×100" }, 1)],
    status: "new",
    activities: [{ id: "act-s3a", at: ago(0, 9), author: "house", message: "Order received.", visible: true }],
    createdAt: ago(0, 9),
  }),
];

const inquiries: Inquiry[] = [
  {
    id: "inq-sample-1",
    type: "wholesale",
    name: "Sample — Hotel buyer",
    phone: "077 000 0004",
    email: "",
    message: "Quote please: 40 white sheet sets 100×110, 40 mattress protectors 72×78, 80 white towels 30×60.",
    productTitle: "",
    productSlug: "",
    status: "in_progress",
    staffNotes: "SAMPLE record. Not a real customer.",
    pagePath: "/wholesale",
    clientToken: "sample-inq-1",
    activities: [{ id: "act-i1", at: ago(1, 15), author: "house", message: "Quote sent on WhatsApp.", visible: false }],
    createdAt: ago(1, 13),
    updatedAt: ago(1, 15),
  },
  {
    id: "inq-sample-2",
    type: "product",
    name: "Sample — Size question",
    phone: "077 000 0005",
    email: "",
    message: "Which sheet set fits a 60×72 mattress?",
    productTitle: "Bed Sheet Set — White",
    productSlug: "bed-sheet-set-white",
    status: "new",
    staffNotes: "SAMPLE record. Not a real customer.",
    pagePath: "/products/bed-sheet-set-white",
    clientToken: "sample-inq-2",
    activities: [],
    createdAt: ago(0, 11),
    updatedAt: ago(0, 11),
  },
];

const customers: Customer[] = [
  { id: "0770000001", name: "Sample — Home order", phone: "077 000 0001", email: "", notes: "Sample record.", orderCount: 1, inquiryCount: 0, createdAt: ago(7), lastSeenAt: ago(7) },
  { id: "0770000002", name: "Sample — Guest house", phone: "077 000 0002", email: "", notes: "Sample record.", orderCount: 1, inquiryCount: 0, createdAt: ago(2), lastSeenAt: ago(2) },
  { id: "0770000003", name: "Sample — New order", phone: "077 000 0003", email: "", notes: "Sample record.", orderCount: 1, inquiryCount: 0, createdAt: ago(0), lastSeenAt: ago(0) },
  { id: "0770000004", name: "Sample — Hotel buyer", phone: "077 000 0004", email: "", notes: "Sample record.", orderCount: 0, inquiryCount: 1, createdAt: ago(1), lastSeenAt: ago(1) },
  { id: "0770000005", name: "Sample — Size question", phone: "077 000 0005", email: "", notes: "Sample record.", orderCount: 0, inquiryCount: 1, createdAt: ago(0), lastSeenAt: ago(0) },
];

function sampleEvents(): AnalyticsEvent[] {
  const paths = ["/", "/shop", "/collections/bedsheets", "/collections/towels", "/collections/duvets", "/products/bed-sheet-set-white", "/products/white-bath-towel", "/products/duvet", "/wholesale", "/cart", "/contact"];
  const buttons = [
    ["Order on WhatsApp", "order-whatsapp"],
    ["Add to bag", "add-to-bag"],
    ["Shop the range", "hero-ban-crown"],
    ["Search", "open-search"],
    ["Get a wholesale quote", "send-inquiry"],
  ] as const;
  const devices = ["mobile", "desktop", "mobile", "mobile", "tablet"] as const;
  const browsers = ["Chrome", "Safari", "Chrome", "Instagram", "Chrome"];
  const systems = ["Android", "iOS", "Windows", "iOS", "Android"];
  const sources = ["", "instagram.com", "google.com", "", "facebook.com"];
  const utm = ["", "instagram", "google", "", "facebook"];
  let seed = 91;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const events: AnalyticsEvent[] = [];
  for (let index = 0; index < 180; index += 1) {
    const day = Math.floor(next() * 14);
    const hour = 8 + Math.floor(next() * 12);
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
      utmCampaign: utm[slot] ? "crown" : "",
      device: devices[slot],
      browser: browsers[slot],
      os: systems[slot],
      screen: devices[slot] === "mobile" ? "390x844" : "1440x900",
      sessionId: `sample-${1 + (index % 36)}`,
      createdAt: ago(day, hour),
    });
  }
  return events;
}

const subscribers: Subscriber[] = [
  { id: "sub-sample-1", email: "sample.one@example.com", name: "Sample", status: "active", token: "sample-token-1", source: "footer", resubscribeCount: 0, subscribedAt: ago(8), unsubscribedAt: null, createdAt: ago(8) },
  { id: "sub-sample-2", email: "sample.two@example.com", name: "Sample", status: "unsubscribed", token: "sample-token-2", source: "popup", resubscribeCount: 0, subscribedAt: ago(20), unsubscribedAt: ago(3), createdAt: ago(20) },
];

const campaigns: Campaign[] = [
  {
    id: "camp-draft",
    name: "New colours (draft)",
    subject: "New colours in bed sheet sets at Crown",
    body: "{{name}},\n\nNew colours have arrived in our bed sheet sets, in all three sizes. Message us on WhatsApp at 074 175 4141 to ask what is on the shelf, or order on the website.\n\n{{store_name}}\nNo. 07, 3rd Cross Street, Colombo 11",
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
