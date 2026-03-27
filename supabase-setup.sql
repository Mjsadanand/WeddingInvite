create extension if not exists "pgcrypto";

create table if not exists public.wedding_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.wedding_gallery enable row level security;

create policy "Public can read wedding gallery"
on public.wedding_gallery
for select
using (true);

create policy "Public can insert wedding gallery"
on public.wedding_gallery
for insert
with check (true);

create policy "Public can delete wedding gallery"
on public.wedding_gallery
for delete
using (true);

-- Create a public storage bucket named wedding-images in the Supabase dashboard.
-- Then apply the following storage policies.

create policy "Public can read wedding images"
on storage.objects
for select
using (bucket_id = 'wedding-images');

create policy "Public can upload wedding images"
on storage.objects
for insert
with check (bucket_id = 'wedding-images');

-- Optional: needed only if you store images in Supabase Storage and want delete there too.
create policy "Public can delete wedding images"
on storage.objects
for delete
using (bucket_id = 'wedding-images');
