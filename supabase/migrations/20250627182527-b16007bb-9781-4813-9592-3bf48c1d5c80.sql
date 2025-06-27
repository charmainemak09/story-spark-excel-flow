
-- Add order_position column to epics table
ALTER TABLE public.epics 
ADD COLUMN order_position INTEGER DEFAULT 0;

-- Add order_position column to user_stories table  
ALTER TABLE public.user_stories 
ADD COLUMN order_position INTEGER DEFAULT 0;

-- Add order_position column to acceptance_criteria table
ALTER TABLE public.acceptance_criteria 
ADD COLUMN order_position INTEGER DEFAULT 0;

-- Update existing records to have sequential order positions
-- For epics within each theme
WITH ranked_epics AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY theme_id ORDER BY created_at) - 1 as new_order
  FROM public.epics
)
UPDATE public.epics 
SET order_position = ranked_epics.new_order
FROM ranked_epics 
WHERE public.epics.id = ranked_epics.id;

-- For user stories within each epic
WITH ranked_stories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY epic_id ORDER BY created_at) - 1 as new_order
  FROM public.user_stories
)
UPDATE public.user_stories 
SET order_position = ranked_stories.new_order
FROM ranked_stories 
WHERE public.user_stories.id = ranked_stories.id;

-- For acceptance criteria within each user story
WITH ranked_criteria AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_story_id ORDER BY created_at) - 1 as new_order
  FROM public.acceptance_criteria
)
UPDATE public.acceptance_criteria 
SET order_position = ranked_criteria.new_order
FROM ranked_criteria 
WHERE public.acceptance_criteria.id = ranked_criteria.id;
