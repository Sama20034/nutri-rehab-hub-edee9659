
-- Clean up duplicate entries first
DELETE FROM client_exercises a USING client_exercises b
WHERE a.id > b.id AND a.client_id = b.client_id AND a.exercise_id = b.exercise_id;

DELETE FROM client_diet_plans a USING client_diet_plans b
WHERE a.id > b.id AND a.client_id = b.client_id AND a.diet_plan_id = b.diet_plan_id;

DELETE FROM client_meal_plans a USING client_meal_plans b
WHERE a.id > b.id AND a.client_id = b.client_id AND a.meal_plan_id = b.meal_plan_id;

DELETE FROM client_videos a USING client_videos b
WHERE a.id > b.id AND a.client_id = b.client_id AND a.video_id = b.video_id;

DELETE FROM client_recipes a USING client_recipes b
WHERE a.id > b.id AND a.client_id = b.client_id AND a.recipe_id = b.recipe_id;

-- Add unique constraints
ALTER TABLE client_exercises ADD CONSTRAINT client_exercises_client_exercise_unique UNIQUE (client_id, exercise_id);
ALTER TABLE client_diet_plans ADD CONSTRAINT client_diet_plans_client_plan_unique UNIQUE (client_id, diet_plan_id);
ALTER TABLE client_meal_plans ADD CONSTRAINT client_meal_plans_client_plan_unique UNIQUE (client_id, meal_plan_id);
ALTER TABLE client_videos ADD CONSTRAINT client_videos_client_video_unique UNIQUE (client_id, video_id);
ALTER TABLE client_recipes ADD CONSTRAINT client_recipes_client_recipe_unique UNIQUE (client_id, recipe_id);
