create table messages(
  id bigint generated always as identity primary key,
  session_id text not null,
  sender text not null check (sender in ('student','admin')),
  body text not null,
  device text,
  created_at timestamptz default now());
alter table messages enable row level security;
create policy "student insert" on messages for insert to anon with check (sender='student');
create policy "student read" on messages for select to anon using (true);
create policy "admin all" on messages for all to authenticated using (true) with check (true);
alter publication supabase_realtime add table messages;
