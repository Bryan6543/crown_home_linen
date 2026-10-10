import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@/components/store/analytics";
import { CartProvider } from "@/components/store/cart";
import { Footer, Header } from "@/components/store/chrome";
import { NewsletterPopup } from "@/components/store/newsletter-popup";
import { PageFade } from "@/components/store/page-fade";
import { activeProducts, lowestPrice, navItems } from "@/lib/catalog";
import { getSnapshot } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getSnapshot();
  return {
    title: { default: snapshot.settings.metaTitle, template: "%s — CrownHomeLinen" },
    description: snapshot.settings.metaDescription,
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getSnapshot();
  const products = activeProducts(snapshot).map((product) => ({
    title: product.title,
    slug: product.slug,
    price: lowestPrice(product),
    imageUrl: product.images[0]?.url || "",
    currency: snapshot.settings.currency,
  }));

  return (
    <CartProvider currency={snapshot.settings.currency}>
      <Suspense fallback={null}>
        <Analytics measurementId={snapshot.settings.gaMeasurementId} />
      </Suspense>
      <Header
        storeName={snapshot.settings.storeName}
        announcement={snapshot.settings.announcement}
        announcementEnabled={snapshot.settings.announcementEnabled}
        nav={navItems(snapshot, "header")}
        products={products}
      />
      <main className="flex-1">
        <PageFade>{children}</PageFade>
      </main>
      {snapshot.settings.popupEnabled ? (
        <NewsletterPopup title={snapshot.settings.popupTitle} body={snapshot.settings.popupBody} />
      ) : null}
      <Footer
        storeName={snapshot.settings.storeName}
        note={snapshot.settings.footerNote}
        email={snapshot.settings.email}
        phone={snapshot.settings.phoneDisplay}
        address={snapshot.settings.address}
        city={snapshot.settings.city}
        hours={snapshot.settings.hours}
        instagram={snapshot.settings.instagram}
        whatsappNumber={snapshot.settings.whatsappNumber}
        greeting={snapshot.settings.whatsappGreeting}
        shop={navItems(snapshot, "footer_shop")}
        help={navItems(snapshot, "footer_help")}
        company={navItems(snapshot, "footer_company")}
      />
    </CartProvider>
  );
}
