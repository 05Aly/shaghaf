create table if not exists messages(
  id bigint generated always as identity primary key,
  session_id text not null,
  sender text not null check (sender in ('student','admin')),
  body text not null,
  device text,
  created_at timestamptz default now());
create index if not exists messages_session_idx on messages(session_id, created_at);
alter table messages enable row level security;
create policy "student insert" on messages for insert to anon
  with check (sender='student' and char_length(body) between 1 and 1000 and char_length(session_id)=36);
create policy "student read" on messages for select to anon using (true);
-- Any signed-in user is admin: DISABLE sign-ups in Supabase Auth and create only your account.
create policy "admin all" on messages for all to authenticated using (true) with check (true);
-- Stricter alternative (replace the policy above, put your email):
-- create policy "admin only" on messages for all to authenticated
--   using ((auth.jwt() ->> 'email') = 'you@example.com') with check ((auth.jwt() ->> 'email') = 'you@example.com');
alter publication supabase_realtime add table messages;
