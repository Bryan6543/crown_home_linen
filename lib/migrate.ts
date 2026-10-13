import type { Activity, EmailTemplate, Settings, StoreSnapshot } from "@/lib/types";

const mailDefaults = {
  emailFrom: "Crown <hello@crownhomelinen.com>",
  popupEnabled: true,
  popupTitle: "New stock, now and then",
  popupBody: "New stock and the occasional note from Crown. Leave an email, and leave whenever you like.",
  sceneEnabled: false,
  sceneAssetUrl: "",
  sceneYaw: 0,
  sceneCaption: "",
};

export const defaultTemplates = (): EmailTemplate[] => [
  {
    id: "welcome",
    name: "Welcome",
    subject: "You are on the {{store_name}} list",
    body: "{{name}},\n\nYou asked for the occasional note from {{store_name}}. We write when new stock or colours arrive, and not to fill a week.\n\nIf this was not you, or you change your mind, you can leave the list yourself:\n{{unsubscribe_url}}",
  },
  {
    id: "welcome_back",
    name: "Welcome back",
    subject: "You are back on the {{store_name}} list",
    body: "{{name}},\n\nYou are subscribed again. We will not send the letters you missed. The next one, when there is one, will come to this address.\n\nLeave again any time:\n{{unsubscribe_url}}",
  },
  {
    id: "order_update",
    name: "Order update",
    subject: "{{store_name}} order {{order_number}} is {{status_label}}",
    body: "{{name}},\n\nYour order {{order_number}} is now {{status_label}}.\n\n{{public_note}}\n\nLook it up any time with the order number and the phone on the order:\n{{order_url}}",
  },
];

export function migrateSnapshot(input: StoreSnapshot): StoreSnapshot {
  const snapshot = input;
  snapshot.settings = { ...mailDefaults, ...snapshot.settings };
  snapshot.subscribers = snapshot.subscribers || [];
  snapshot.settings.logoUrl = snapshot.settings.logoUrl || "";
  snapshot.campaigns = snapshot.campaigns || [];
  snapshot.deliveries = snapshot.deliveries || [];
  snapshot.templates = mergeTemplates(snapshot.templates);
  snapshot.orders = (snapshot.orders || []).map((order) => ({
    ...order,
    publicNote: order.publicNote || "",
    activities: (order.activities || []).map((activity) => ({
      ...activity,
      visible: activity.visible ?? false,
    })),
  }));
  if (!snapshot.navigation.some((item) => item.href === "/orders")) {
    snapshot.navigation.push({
      id: "nav-orders",
      label: "Your orders",
      href: "/orders",
      location: "footer_help",
      sort: 0,
      visible: true,
    });
  }
  return snapshot;
}

function mergeTemplates(current: EmailTemplate[] | undefined) {
  const defaults = defaultTemplates();
  if (!current?.length) return defaults;
  return defaults.map((template) => current.find((item) => item.id === template.id) || template);
}

export function blankActivity(message: string, author: string, visible: boolean): Activity {
  return { id: crypto.randomUUID(), at: new Date().toISOString(), author, message, visible };
}

export function mailSettings(settings: Settings) {
  return { ...mailDefaults, ...settings };
}
