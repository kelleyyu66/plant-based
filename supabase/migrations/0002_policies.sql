-- RLS + storage policies. design.md §3 / plan Phase 8.

alter table profiles enable row level security;
alter table meals enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table teams enable row level security;
alter table daily_facts enable row level security;
alter table daily_quests enable row level security;
alter table accessories enable row level security;

-- Everyone in the cohort can read profiles/meals/social (needed for feed & leaderboards).
create policy "read profiles" on profiles for select to authenticated using (true);
create policy "insert own profile" on profiles for insert to authenticated with check (id = auth.uid());
create policy "update own profile" on profiles for update to authenticated using (id = auth.uid());

create policy "read meals" on meals for select to authenticated using (true);
create policy "write own meals" on meals for insert to authenticated with check (user_id = auth.uid());
create policy "update own meals" on meals for update to authenticated using (user_id = auth.uid());
create policy "delete own meals" on meals for delete to authenticated using (user_id = auth.uid());

create policy "read comments" on comments for select to authenticated using (true);
create policy "write own comments" on comments for insert to authenticated with check (user_id = auth.uid());
create policy "delete own comments" on comments for delete to authenticated using (user_id = auth.uid());

create policy "read reactions" on reactions for select to authenticated using (true);
create policy "write own reactions" on reactions for insert to authenticated with check (user_id = auth.uid());
create policy "delete own reactions" on reactions for delete to authenticated using (user_id = auth.uid());

-- Seed-only reference tables: read-only for clients.
create policy "read teams" on teams for select to authenticated using (true);
create policy "read facts" on daily_facts for select to authenticated using (true);
create policy "read quests" on daily_quests for select to authenticated using (true);
create policy "read accessories" on accessories for select to authenticated using (true);

grant select on v_user_points, v_leaderboard, v_team_points, v_challenge_impact to authenticated;

-- Storage: meal photos, path {user_id}/{meal_id}.webp
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', true)
  on conflict (id) do nothing;

create policy "read meal photos" on storage.objects for select to authenticated
  using (bucket_id = 'meal-photos');
create policy "write own meal photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "update own meal photos" on storage.objects for update to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own meal photos" on storage.objects for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
