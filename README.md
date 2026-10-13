# Crown — crownhomelinen.com

The online shop for Crown, No. 07, 3rd Cross Street, Colombo 11: importers and wholesale dealers in textiles, specialists in bedsheets and towels. Customers do not pay on the site. An order is saved in the house book, then WhatsApp opens with the details so someone at Crown can confirm stock, delivery, and the total.

Next.js 16 (App Router), Tailwind CSS 4, Supabase (database, sign-in, photo storage). Deployed on Netlify.

## Run it locally

```bash
npm install
npm run dev:file
```

Open [http://localhost:3000](http://localhost:3000).

`dev:file` uses the local file store `data/store.json` (created from `lib/seed.ts` on the first request, not committed), even if `.env.local` has Supabase keys. **Use it for trying things out**: orders, questions, and sign-ups made there never reach the live database. Delete `data/store.json` to start fresh.

`npm run dev` uses whatever `.env.local` says. If that holds the live Supabase keys, every test order, question, and page visit goes into the live house book.

The local house book is at [http://localhost:3000/admin](http://localhost:3000/admin): `admin@crownhomelinen.com` / `CrownHome#2026`. Change that password with `DEMO_ADMIN_PASSWORD` before the app runs anywhere public; in production, local sign-in is refused until it is set.

## Scripts

```bash
npm run dev:file    # local file store, port 3000 (use this)
npm run dev         # uses .env.local
npm run build
npm run start
npm run lint
npm run typecheck
npm test            # catalogue, search, size guide, prices, WhatsApp text
```

## Content

`lib/seed.ts` holds Crown's real catalogue: the 13 items from "Item List for website.xlsx" at POS retail prices (Sept 2026), the collections, every page's copy, menus, and questions. Stock is a placeholder (20 a size); the shop only ever shows "In stock".

The orders, inquiries, customers, subscribers, and visits further down that file are **samples**, named "Sample — …" with phone numbers like 077 000 0001. They load only into the local file store.

**Settings → Restore Crown catalogue** in the house book writes the seed's catalogue, pages, menus, and questions back into the database and removes anything else in those tables. On Supabase it never touches orders, inquiries, customers, letters, or visits, and it keeps the uploaded logo and analytics ID. It asks you to type RESTORE first.

Products without a photo show a drawn "plate" on the Crown navy or ivory ground (white items on navy, coloured items on ivory). Upload real photos in the house book under Pieces and they replace the plate.

## What you can edit

From the house book, without touching code:

- Pieces: title, price, description, material, care, sizes, colours, photos, draft or active
- Collections, homepage banners, and every section on every page (including the new Why Crown, How ordering works, Wholesale, Size guide, and Visit the shop blocks)
- Menus, questions, and reviews (Notes; none yet — add only real ones)
- The announcement bar, WhatsApp number, address, hours, email, Instagram, currency, and Google Analytics ID
- Order and inquiry status, staff notes, and customer notes

Prices are stored in cents: LKR 1,250 is `125000`.

## Pages

Home, shop (search, collection, size, and sort filters, kept in the address bar), four collections, 13 product pages, bag and checkout, wholesale quote, order tracking, about, contact, questions, size guide, delivery, returns, privacy, and linen care.

## WhatsApp

Set the number in **Settings**: digits with the country code, no plus sign (`94741754141`).

1. The bag is priced on the server from the current catalogue.
2. The order is written into the book with a number like `CHL-1101`.
3. WhatsApp opens to Crown's number with the order text. If the browser blocks the new tab, the confirmation panel shows an Open WhatsApp button.

Questions from the contact page, product pages, and wholesale quotes follow the same path and appear under **Inquiries** (type `wholesale` for quote requests).

## Supabase

Run `supabase/schema.sql` once on a new project. On the **existing** project, run `supabase/migrations/2026-10-13-order-numbers.sql` once in the SQL editor. It:

- adds the order number sequence, so customers who are not signed in get numbers like CHL-1101. Without it the site falls back to dated numbers like CHL-261013-4821, which still work.
- makes order lookup match the last nine digits of the phone, so `077 123 4567` and `+94 77 123 4567` both find the order.

Environment variables (`.env.local` locally, Netlify → Site settings → Environment variables in production):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://crownhomelinen.com   # canonical links, sitemap, share previews
SESSION_SECRET=a-long-random-string
RESEND_API_KEY=                                  # letters; optional
EMAIL_FROM=Crown <hello@your-verified-domain>    # letters; optional
```

## Letters

Sign-ups live under Letters. A new address gets the welcome letter; an address that left and returns gets the welcome-back letter. Every letter links to `/unsubscribe`. Set `RESEND_API_KEY` and `EMAIL_FROM` (a domain verified in Resend) before letters actually send; without them sign-ups are still saved.

## Analytics

Every page visit and every tracked button is stored in the book: path, device, browser, operating system, screen size, referrer, and UTM source. Paste a GA4 measurement ID in Settings to also send them to Google Analytics.

## Deploying

Push to the branch Netlify builds from. Before the first deploy of this version:

1. Run the migration above on Supabase.
2. Set `NEXT_PUBLIC_SITE_URL=https://crownhomelinen.com` in Netlify.
3. After it is live, sign in to the house book. If the live catalogue still shows the old sample shop (Turkish towels, robes, a US phone number), use **Settings → Restore Crown catalogue**, then add product photos.
