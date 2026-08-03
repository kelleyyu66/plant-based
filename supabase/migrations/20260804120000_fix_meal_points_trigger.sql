-- Fix: logging a meal failed with `relation "daily_quests" does not exist` (42P01).
--
-- fn_compute_meal_points (the meals points/CO2 trigger) read the daily_quests
-- table by its UNQUALIFIED name to apply the old point multiplier. fn_log_meal
-- runs with `search_path = ''`, so when its INSERT fired this trigger the
-- unqualified `daily_quests` couldn't be resolved and the whole log failed.
--
-- The app dropped the multiplier: a meal is now worth its tier base + a flat
-- photo bonus, and the once-per-day daily-quest bonuses are applied on the
-- client. So we remove the daily_quests lookup entirely. `search_path = public`
-- keeps the meal_tier enum resolvable regardless of the caller's search_path.
create or replace function fn_compute_meal_points()
returns trigger language plpgsql
set search_path = public as $$
declare
  base int;
  footprint numeric;
begin
  base := case new.tier
    when 'vegan' then 10 when 'vegetarian' then 8
    when 'fish' then 5 when 'chicken' then 5
    when 'pork' then 2 else 0 end;
  footprint := case new.tier
    when 'beef' then 6.6 when 'pork' then 1.7 when 'fish' then 1.5
    when 'chicken' then 1.3 when 'vegetarian' then 0.9 else 0.4 end;

  new.points := base + (case when new.photo_path is not null then 1 else 0 end);
  new.co2_saved_kg := greatest(0, 2.9 - footprint);
  return new;
end $$;
