-- Daily quest completion is calculated from authenticated users' meal logs.
-- Tags and protein values are supplied when a meal is logged; completion itself is never client-written.

create type quest_tag as enum ('tofu', 'edamame', 'five_colours', 'tempeh', 'cooked_at_home');
create type daily_challenge_kind as enum ('tofu', 'edamame', 'five_colours', 'tempeh', 'cooked_at_home', 'plant_protein_50g', 'all_plant_meals');

alter table meals
  add column quest_tags quest_tag[] not null default '{}',
  add column plant_protein_grams int not null default 0 check (plant_protein_grams >= 0);

create table daily_challenges (
  id uuid primary key default gen_random_uuid(),
  day_index int not null unique,
  kind daily_challenge_kind not null,
  title text not null
);

alter table daily_challenges enable row level security;
create policy "read daily challenges" on daily_challenges for select to authenticated using (true);

-- Add quest fields to the existing atomic meal logger.
create or replace function fn_log_meal(
  p_tier meal_tier, p_time meal_time, p_date date,
  p_photo_path text, p_caption text,
  p_quest_tags quest_tag[] default '{}', p_plant_protein_grams int default 0
) returns meals language plpgsql security definer set search_path = '' as $$
declare
  pr public.profiles%rowtype;
  m public.meals%rowtype;
  gap int;
  new_streak int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_plant_protein_grams < 0 then raise exception 'plant protein grams cannot be negative'; end if;

  select * into pr from public.profiles where id = auth.uid();
  if not found then raise exception 'not onboarded'; end if;

  insert into public.meals (user_id, tier, meal_time, meal_date, photo_path, caption, quest_tags, plant_protein_grams)
  values (auth.uid(), p_tier, p_time, p_date, p_photo_path, p_caption, coalesce(p_quest_tags, '{}'), p_plant_protein_grams)
  returning * into m;

  if pr.last_logged_date is null then
    new_streak := 1;
  elsif pr.last_logged_date = p_date then
    new_streak := pr.streak_current;
  else
    gap := p_date - pr.last_logged_date;
    new_streak := case when gap = 1 then pr.streak_current + 1 else 1 end;
  end if;

  update public.profiles set
    streak_current = new_streak,
    streak_best = greatest(streak_best, new_streak),
    last_logged_date = greatest(coalesce(last_logged_date, p_date), p_date)
  where id = auth.uid();

  return m;
end $$;

-- The API returns only the caller's derived completion state for a chosen cohort date.
create or replace function fn_daily_quest_progress(p_date date)
returns table (task_id text, title text, completed boolean)
language sql security invoker set search_path = '' as $$
  with today_meals as (
    select * from public.meals where user_id = auth.uid() and meal_date = p_date
  ),
  challenge as (
    select * from public.daily_challenges
    order by day_index
    offset (extract(doy from p_date)::int % greatest((select count(*) from public.daily_challenges), 1))
    limit 1
  ),
  summary as (
    select
      count(*)::int as meal_count,
      count(*) filter (where tier in ('vegan', 'vegetarian'))::int as plant_meal_count,
      coalesce(sum(plant_protein_grams), 0)::int as plant_protein_grams,
      coalesce(bool_and('cooked_at_home' = any(quest_tags)), false) as all_home,
      coalesce(bool_and(tier in ('vegan', 'vegetarian')), false) as all_plant,
      coalesce(bool_or('tofu' = any(quest_tags)), false) as has_tofu,
      coalesce(bool_or('edamame' = any(quest_tags)), false) as has_edamame,
      coalesce(bool_or('five_colours' = any(quest_tags)), false) as has_five_colours,
      coalesce(bool_or('tempeh' = any(quest_tags)), false) as has_tempeh
    from today_meals
  )
  select 'plant_meal', 'Eat one plant-based meal', summary.plant_meal_count > 0 from summary
  union all
  select 'three_meals', 'Log all three meals', summary.meal_count = 3 from summary
  union all
  select challenge.kind::text, challenge.title,
    case challenge.kind
      when 'tofu' then summary.has_tofu
      when 'edamame' then summary.has_edamame
      when 'five_colours' then summary.has_five_colours
      when 'tempeh' then summary.has_tempeh
      when 'cooked_at_home' then summary.meal_count = 3 and summary.all_home
      when 'plant_protein_50g' then summary.plant_protein_grams >= 50
      when 'all_plant_meals' then summary.meal_count = 3 and summary.all_plant
    end
  from challenge cross join summary;
$$;

revoke execute on function public.fn_daily_quest_progress(date) from public, anon;
grant execute on function public.fn_daily_quest_progress(date) to authenticated;

revoke execute on function public.fn_log_meal(meal_tier, meal_time, date, text, text, quest_tag[], int) from public, anon;
grant execute on function public.fn_log_meal(meal_tier, meal_time, date, text, text, quest_tag[], int) to authenticated;
