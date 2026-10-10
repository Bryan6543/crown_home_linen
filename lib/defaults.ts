import type { Section } from "@/lib/types";

export function newId() {
  return crypto.randomUUID();
}

export function blankSection(type: Section["type"], pageSlug: string, sort: number): Section {
  const base = { id: newId(), pageSlug, visible: true, sort };
  switch (type) {
    case "hero":
      return { ...base, type: "hero" };
    case "product_grid":
      return { ...base, type, title: "Selected pieces", subtitle: "", source: "featured", limit: 4 };
    case "image_text":
      return {
        ...base,
        type,
        eyebrow: "The house",
        title: "New section",
        body: "Write the story for this block.",
        imageUrl: "/images/editorial/still-life.jpg",
        imageAlt: "",
        buttonLabel: "Shop the edit",
        buttonHref: "/shop",
        align: "left",
      };
    case "categories":
      return { ...base, type, title: "Shop by cloth", subtitle: "" };
    case "values":
      return {
        ...base,
        type,
        title: "How the house works",
        items: [
          { title: "Woven heavy", text: "Long-staple cotton and washed linen." },
          { title: "Ordered by message", text: "Every order is confirmed on WhatsApp." },
        ],
      };
    case "testimonials":
      return { ...base, type, title: "From the house book", subtitle: "" };
    case "newsletter":
      return {
        ...base,
        type,
        title: "A note, occasionally",
        subtitle: "Leave a number and we will write when the next cloth arrives.",
        buttonLabel: "Send on WhatsApp",
      };
    case "rich_text":
      return { ...base, type, title: "Page title", body: "Write this page." };
    case "faq":
      return { ...base, type, title: "Questions", subtitle: "" };
    case "promo":
      return {
        ...base,
        type,
        eyebrow: "This week",
        title: "A quieter white",
        body: "",
        imageUrl: "/images/heroes/bed.jpg",
        imageAlt: "",
        buttonLabel: "View the bed",
        buttonHref: "/collections/bedsheets",
      };
    case "contact":
      return { ...base, type, title: "Write to the house", subtitle: "Orders and questions both come through here." };
    case "gallery":
      return { ...base, type, title: "Inside the house", subtitle: "", images: [] };
  }
}
