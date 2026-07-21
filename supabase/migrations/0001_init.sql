-- Moo — Plant-Based Challenge 2026 schema. Deployed in Phase 8.
-- Mirrors src/lib engine + design.md §9. Points/CO2 are authoritative here (trigger).

-- ---------- enums ----------
create type meal_tier as enum ('vegan','vegetarian','fish','chicken','pork','beef');
create type meal_time as enum ('breakfast','lunch','dinner');
create type starting_diet as enum ('vegetarian','meat_or_flexitarian');

-- ---------- teams ----------
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  captain_name text not null,
  slug text unique not null,
  capacity int not null default 12,
  color text not null default '#8FCB3C',
  sort int not null default 0
);

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_index int not null check (avatar_index between 0 and 19),
  team_id uuid references teams,
  starting_diet starting_diet not null,
  onboarding jsonb,
  streak_goal int not null default 7 check (streak_goal in (3,5,7)),
  streak_current int not null default 0,
  streak_best int not null default 0,
  last_logged_date date,
  created_at timestamptz not null default now()
);

-- ---------- meals ----------
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  tier meal_tier not null,
  meal_time meal_time not null,
  meal_date date not null,
  photo_path text,
  caption text,
  points int not null default 0,       -- set by trigger (authoritative)
  co2_saved_kg numeric not null default 0, -- set by trigger
  created_at timestamptz not null default now(),
  -- 3 meals/day cap: only 3 time slots exist, so one row per slot per day.
  unique (user_id, meal_date, meal_time)
);

-- ---------- daily content ----------
create table daily_facts (
  id uuid primary key default gen_random_uuid(),
  day_index int not null,
  body text not null,
  source_url text
);
create table daily_quests (
  id uuid primary key default gen_random_uuid(),
  day_index int not null,
  title text not null,
  tier meal_tier,            -- null = any plant-based meal
  multiplier numeric not null default 2,
  description text not null
);
create table accessories (
  id uuid primary key default gen_random_uuid(),
  sort int not null,
  name text not null,
  threshold_points int not null,
  sprite_variant text not null,
  description text not null
);

-- ---------- social ----------
create table comments (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create table reactions (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (meal_id, user_id, emoji)
);

-- ---------- points/CO2 trigger (authoritative) ----------
-- Mirrors src/lib/points.ts + impact.ts. Client-sent points/co2 are ignored.
create or replace function fn_compute_meal_points()
returns trigger language plpgsql as $$
declare
  base int;
  footprint numeric;
  q daily_quests%rowtype;
  mult numeric := 1;
begin
  base := case new.tier
    when 'vegan' then 10 when 'vegetarian' then 8
    when 'fish' then 5 when 'chicken' then 5
    when 'pork' then 2 else 0 end;
  footprint := case new.tier
    when 'beef' then 6.6 when 'pork' then 1.7 when 'fish' then 1.5
    when 'chicken' then 1.3 when 'vegetarian' then 0.9 else 0.4 end;

  -- Active quest for the meal's day (rotation by day-of-year % count).
  select * into q from daily_quests
   order by day_index
   offset (extract(doy from new.meal_date)::int %
           greatest((select count(*) from daily_quests),1))
   limit 1;
  if found then
    if q.tier is null then
      if new.tier in ('vegan','vegetarian') then mult := q.multiplier; end if;
    elsif q.tier = new.tier then
      mult := q.multiplier;
    end if;
  end if;

  -- Quest multiplies the tier base only; photo +1 is flat.
  new.points := round(base * mult) + (case when new.photo_path is not null then 1 else 0 end);
  new.co2_saved_kg := greatest(0, 2.9 - footprint);
  return new;
end $$;

create trigger trg_meal_points
  before insert or update on meals
  for each row execute function fn_compute_meal_points();

-- ---------- log-meal RPC (atomic insert + streak) ----------
create or replace function fn_log_meal(
  p_tier meal_tier, p_time meal_time, p_date date,
  p_photo_path text, p_caption text
) returns meals language plpgsql security definer as $$
declare
  pr profiles%rowtype;
  m meals%rowtype;
  gap int;
  new_streak int;
begin
  select * into pr from profiles where id = auth.uid();
  if not found then raise exception 'not onboarded'; end if;

  insert into meals (user_id, tier, meal_time, meal_date, photo_path, caption)
  values (auth.uid(), p_tier, p_time, p_date, p_photo_path, p_caption)
  returning * into m;

  -- Streak update (any meal counts; same-day no-op; gap resets).
  if pr.last_logged_date is null then
    new_streak := 1;
  elsif pr.last_logged_date = p_date then
    new_streak := pr.streak_current;
  else
    gap := p_date - pr.last_logged_date;
    new_streak := case when gap = 1 then pr.streak_current + 1 else 1 end;
  end if;

  update profiles set
    streak_current = new_streak,
    streak_best = greatest(streak_best, new_streak),
    last_logged_date = greatest(coalesce(last_logged_date, p_date), p_date)
  where id = auth.uid();

  return m;
end $$;

-- ---------- derived views (security_invoker so RLS applies) ----------
create view v_user_points with (security_invoker = on) as
  select user_id, coalesce(sum(points),0)::int as points, count(*)::int as meals
  from meals group by user_id;

create view v_leaderboard with (security_invoker = on) as
  select p.*, coalesce(vp.points,0) as total_points, coalesce(vp.meals,0) as meal_count
  from profiles p left join v_user_points vp on vp.user_id = p.id;

create view v_team_points with (security_invoker = on) as
  select t.id as team_id, t.name, coalesce(sum(m.points),0)::int as points
  from teams t
  left join profiles p on p.team_id = t.id
  left join meals m on m.user_id = p.id
  group by t.id, t.name;

create view v_challenge_impact with (security_invoker = on) as
  select coalesce(sum(co2_saved_kg),0) as co2_saved_kg from meals;
