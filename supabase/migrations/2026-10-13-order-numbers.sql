-- Order numbers for signed-out customers.
--
-- A visitor cannot read the orders table (row-level security), so the shop
-- cannot work out the next number by looking at the last one. This sequence
-- hands out numbers instead. Run once in the Supabase SQL editor.
-- Safe to run again.

create sequence if not exists public.order_number_seq;

-- Start after the highest number already used, so CHL-1001..CHL-1005 and any
-- dated fallback numbers are never handed out twice.
select setval(
  'public.order_number_seq',
  greatest(
    1100,
    coalesce((select max((regexp_match(number, '^CHL-(\d{4,6})$'))[1]::int) from public.orders), 0)
  )
);

create or replace function public.next_order_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'CHL-' || nextval('public.order_number_seq')::text;
$$;

grant execute on function public.next_order_number() to anon, authenticated;

-- Order lookup: compare the last nine digits of the phone, so a number typed
-- as 077 123 4567 at checkout still matches +94 77 123 4567 at lookup.
create or replace function public.lookup_order(order_number text, phone_digits text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select (doc - 'staffNotes' - 'clientToken')
  from public.orders
  where lower(doc->>'number') = lower(order_number)
    and length(phone_digits) >= 9
    and right(regexp_replace(coalesce(doc->>'phone', ''), '\D', '', 'g'), 9) = right(phone_digits, 9)
  limit 1;
$$;

grant execute on function public.lookup_order(text, text) to anon, authenticated;
