# CrownHomeLinen

A house shop for towels, pillows, bedsheets, and bath wear. Customers do not pay on the site. An order is saved in the house book, then WhatsApp opens with the details so someone can confirm the total.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The shop works before Supabase is connected. Catalog, orders, inquiries, page copy, and visits are stored in `data/store.json` (created on the first request, not committed).

The house book is at [http://localhost:3000/admin](http://localhost:3000/admin).

- Email: `admin@crownhomelinen.com`
- Password: `CrownHome#2026`

Change that password with `DEMO_ADMIN_PASSWORD` before you put the app anywhere public. In production, local sign-in is refused until that variable is set.

## What you can edit

From the house book, without touching code:

- Pieces: title, price, compare-at price, description, cloth, care, sizes, colors, photos, draft or active
- Collections
- Homepage banners and every section on the home, about, contact, questions, shipping, returns, privacy, and care pages
- Navigation
- Testimonials and questions
- The announcement bar, WhatsApp number, address, currency, and Google Analytics measurement ID
- Order and inquiry status, staff notes, and customer notes

Prices are stored in cents. `4800` is $48.00 when the currency is USD.

## WhatsApp

Set the house number in **Settings**. Digits and country code only, no plus sign. The sample value `15551234567` is a placeholder.

Placing an order:

1. The bag is priced on the server from the current catalog.
2. The order is written into the book with a number like `CHL-1003`.
3. WhatsApp opens to the house number with the order text.

Inquiries from the contact page, a product page, and the homepage note follow the same path and stay in **Inquiries**.

## Letters

The list lives under Letters in the house book. A new address gets the welcome letter. The same address again is left as it is. An address that had unsubscribed and joins again is marked as a return and gets the welcome-back letter, not a second welcome. Every letter includes a link to `/unsubscribe`, and mailbox one-click unsubscribe posts to `/api/unsubscribe`.

Campaigns are drafts until you send them. A send goes to every active subscriber except the sample `@example.com` rows, skips anyone who already received that campaign, and records each delivery. Set `RESEND_API_KEY` and `EMAIL_FROM` (a verified Resend domain) before a letter will actually leave the machine. Without those, signups are still saved.

## Orders

Customers open Your orders and enter the order number plus the phone on the order. They see the path Received, Accepted, Confirmed, Packed, On the way, Delivered, plus any note you marked as visible. Staff notes stay private. On the order in the house book you can change the status, write the public note, and optionally email the customer.

## Analytics

Every page visit and every button with a tracking label is stored in the book: path, device, browser, operating system, screen size, referrer, and UTM source. **Analytics** in the house book shows the last 7, 14, or 30 days.

Paste a GA4 measurement ID in Settings (or `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not required — the field in Settings is the one the shop reads) to also send those events to Google Analytics. The house book still keeps its own copy.

The first book includes sample visits so the board is not empty. They are marked with session ids that start with `sample-`.

## Supabase

1. Create a project.
2. Run `supabase/schema.sql` in the SQL editor. The first account that signs up becomes the owner. Later accounts are customers and cannot open the house book until you set `profiles.role` to `staff` or `admin`.
3. In Storage, confirm the public bucket `catalog` exists (the SQL creates it).
4. Copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain
SESSION_SECRET=a-long-random-string
```

5. Restart the app, open `/admin/login`, and create the owner account.
6. In Settings, choose **Reload the sample catalog** once. That writes the towels, copy, banners, and sample orders into Supabase.

If email confirmation is turned on in Supabase, confirm the message before the owner can sign in.

## Pages

Shop, collection, product, bag, search, our house, contact, questions, shipping, returns, privacy, and cloth care.

## Scripts

```bash
npm run dev
npm run build
npm run start
```
"# crown_home_linen" 
