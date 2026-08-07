-- Fix: logging a meal with the Day 4 quest toggle on failed for every user
-- ("Something went sideways") once the app's Day 4 challenge was renamed from
-- "Eat tempeh" to "Eat green vegetables" (client-side only, in
-- src/content/seed.ts). fn_log_meal's p_quest_tags parameter is typed
-- quest_tag[], and the live enum only knew the original five tags — so
-- Postgres rejected the RPC call with "invalid input value for enum
-- quest_tag: green_vegetables" the moment someone toggled "Includes green
-- vegetables" and hit Log it. That error isn't SLOT_TAKEN or MEAL_CAP, so the
-- client fell through to its generic failure message.
--
-- Additive only: 'tempeh' stays in both enums so historically-tagged meals
-- keep resolving correctly; Postgres enum values can't be cheaply removed
-- anyway.
--
-- This has to be its own migration, separate from anything that *uses* the
-- new label (see the next migration) — Postgres refuses to reference a new
-- enum value inside the same transaction that added it ("unsafe use of new
-- value ... New enum values must be committed before they can be used").
alter type quest_tag add value if not exists 'green_vegetables';
alter type daily_challenge_kind add value if not exists 'green_vegetables';
