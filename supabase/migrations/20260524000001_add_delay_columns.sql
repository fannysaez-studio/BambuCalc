alter table public.quotes
  add column if not exists processing_delay text default '5-7j',
  add column if not exists delivery_delay   text default 'pickup';
