-- Recognize the new 'green_vegetables' quest tag (added in the prior
-- migration) alongside 'tempeh' so the day's specific-quest task can
-- complete from either. Kept in its own migration because the previous one
-- only just committed the new enum value — using it any sooner is rejected
-- by Postgres.
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
      coalesce(bool_or('tempeh' = any(quest_tags)), false) as has_tempeh,
      coalesce(bool_or('green_vegetables' = any(quest_tags)), false) as has_green_vegetables
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
      when 'green_vegetables' then summary.has_green_vegetables
      when 'cooked_at_home' then summary.meal_count = 3 and summary.all_home
      when 'plant_protein_50g' then summary.plant_protein_grams >= 50
      when 'all_plant_meals' then summary.meal_count = 3 and summary.all_plant
    end
  from challenge cross join summary;
$$;
