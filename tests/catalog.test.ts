// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesQuery, priceRange, searchProducts, sizeGuide, sizeInCm } from "../lib/catalog.ts";
import { digitsOnly, formatMoney, orderMessage, whatsappUrl } from "../lib/format.ts";
import type { Product, StoreSnapshot } from "../lib/types.ts";

function product(partial: Partial<Product> & Pick<Product, "id" | "title" | "categoryId">): Product {
  return {
    slug: partial.id,
    description: "",
    shortDescription: "",
    price: 0,
    compareAtPrice: null,
    sku: partial.id.toUpperCase(),
    images: [],
    options: [],
    variants: [],
    material: "",
    care: "",
    dimensions: "",
    featured: false,
    bestseller: false,
    status: "active",
    seoTitle: "",
    seoDescription: "",
    sort: 0,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

function variant(id: string, size: string, price: number, available = true) {
  return { id, title: size, sku: id, price, compareAtPrice: null, options: { Size: size }, available, stock: available ? 20 : 0 };
}

const sheets = product({
  id: "sheets",
  title: "Bed Sheet Set — White",
  categoryId: "cat-bedsheets",
  options: [{ name: "Size", values: ["90×90", "100×110"] }],
  variants: [variant("s1", "90×90", 160000), variant("s2", "100×110", 240000)],
});
const towel = product({
  id: "towel",
  title: "Colour Bath Towel",
  categoryId: "cat-towels",
  material: "100% cotton",
  options: [{ name: "Size", values: ["Large", "20×40"] }],
  variants: [variant("t1", "Large", 65000), variant("t2", "20×40", 70000), variant("t3", "27×54", 95000, false)],
});

const snapshot = {
  categories: [
    { id: "cat-bedsheets", name: "Bedsheets", slug: "bedsheets", description: "", imageUrl: "", imageAlt: "", sort: 1, visible: true },
    { id: "cat-towels", name: "Towels", slug: "towels", description: "", imageUrl: "", imageAlt: "", sort: 2, visible: true },
  ],
  products: [sheets, towel, product({ id: "draft", title: "Hidden draft towel", categoryId: "cat-towels", status: "draft" })],
} as unknown as StoreSnapshot;

test("price range spans every size", () => {
  assert.deepEqual(priceRange(sheets), { min: 160000, max: 240000 });
});

test("search matches sizes typed with an x, plurals, and colour spellings", () => {
  assert.equal(matchesQuery(sheets, "Bedsheets", "white 100x110"), true);
  assert.equal(matchesQuery(sheets, "Bedsheets", "sheets"), true);
  assert.equal(matchesQuery(towel, "Towels", "color towels"), true);
  assert.equal(matchesQuery(towel, "Towels", "white"), false);
  assert.equal(matchesQuery(towel, "Towels", ""), true);
});

test("search never returns drafts", () => {
  assert.deepEqual(
    searchProducts(snapshot, "towel").map((item) => item.id),
    ["towel"],
  );
});

test("size guide groups by collection, skips unavailable sizes, and lists named sizes last", () => {
  const groups = sizeGuide(snapshot);
  assert.deepEqual(groups.map((group) => group.name), ["Bedsheets", "Towels"]);
  const towels = groups[1].rows.map((row) => row.size);
  assert.deepEqual(towels, ["20×40", "Large"]);
  assert.equal(groups[0].rows[0].from, 160000);
});

test("inch sizes convert to centimetres", () => {
  assert.equal(sizeInCm("90×100"), "229 × 254 cm");
  assert.equal(sizeInCm("30x60"), "76 × 152 cm");
  assert.equal(sizeInCm("Large"), "");
});

test("money shows whole rupees without decimals", () => {
  assert.equal(formatMoney(125000, "LKR"), "LKR 1,250");
  assert.equal(formatMoney(47550, "LKR"), "LKR 475.50");
});

test("WhatsApp links use digits only and encode the message", () => {
  assert.equal(whatsappUrl("+94 74 175 4141", "Hi & bye"), "https://wa.me/94741754141?text=Hi%20%26%20bye");
  assert.equal(digitsOnly("077-123 4567"), "0771234567");
});

test("order message lists each line and skips an empty email", () => {
  const text = orderMessage(
    {
      number: "CHL-1101",
      customerName: "Test",
      phone: "077 123 4567",
      email: "",
      address: "1 Road",
      city: "Colombo",
      notes: "",
      subtotal: 480000,
      items: [{ productId: "sheets", slug: "sheets", title: "Bed Sheet Set — White", variantId: "s2", variantTitle: "100×110", sku: "s2", quantity: 2, unitPrice: 240000, imageUrl: "" }],
    },
    { storeName: "Crown", currency: "LKR" },
  );
  assert.match(text, /^Crown order CHL-1101/);
  assert.match(text, /2 × Bed Sheet Set — White \(100×110\) — LKR 4,800/);
  assert.doesNotMatch(text, /077 123 4567\n\n\n/);
  assert.match(text, /Total LKR 4,800$/);
});
