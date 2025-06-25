
-- Create themes table
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create epics table
CREATE TABLE public.epics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stories table
CREATE TABLE public.user_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create acceptance_criteria table
CREATE TABLE public.acceptance_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_story_id UUID REFERENCES public.user_stories(id) ON DELETE CASCADE NOT NULL,
  given_condition TEXT NOT NULL,
  when_action TEXT NOT NULL,
  then_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for themes
CREATE POLICY "Users can view their own themes" 
  ON public.themes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own themes" 
  ON public.themes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes" 
  ON public.themes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes" 
  ON public.themes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for epics (access through theme ownership)
CREATE POLICY "Users can view epics of their themes" 
  ON public.epics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.themes 
    WHERE themes.id = epics.theme_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create epics for their themes" 
  ON public.epics 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.themes 
    WHERE themes.id = epics.theme_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update epics of their themes" 
  ON public.epics 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.themes 
    WHERE themes.id = epics.theme_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete epics of their themes" 
  ON public.epics 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.themes 
    WHERE themes.id = epics.theme_id 
    AND themes.user_id = auth.uid()
  ));

-- Create RLS policies for user_stories (access through epic ownership)
CREATE POLICY "Users can view user stories of their epics" 
  ON public.user_stories 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.epics 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE epics.id = user_stories.epic_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create user stories for their epics" 
  ON public.user_stories 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.epics 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE epics.id = user_stories.epic_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update user stories of their epics" 
  ON public.user_stories 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.epics 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE epics.id = user_stories.epic_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete user stories of their epics" 
  ON public.user_stories 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.epics 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE epics.id = user_stories.epic_id 
    AND themes.user_id = auth.uid()
  ));

-- Create RLS policies for acceptance_criteria (access through user story ownership)
CREATE POLICY "Users can view acceptance criteria of their user stories" 
  ON public.acceptance_criteria 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_stories 
    JOIN public.epics ON epics.id = user_stories.epic_id 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE user_stories.id = acceptance_criteria.user_story_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create acceptance criteria for their user stories" 
  ON public.acceptance_criteria 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_stories 
    JOIN public.epics ON epics.id = user_stories.epic_id 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE user_stories.id = acceptance_criteria.user_story_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update acceptance criteria of their user stories" 
  ON public.acceptance_criteria 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_stories 
    JOIN public.epics ON epics.id = user_stories.epic_id 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE user_stories.id = acceptance_criteria.user_story_id 
    AND themes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete acceptance criteria of their user stories" 
  ON public.acceptance_criteria 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.user_stories 
    JOIN public.epics ON epics.id = user_stories.epic_id 
    JOIN public.themes ON themes.id = epics.theme_id 
    WHERE user_stories.id = acceptance_criteria.user_story_id 
    AND themes.user_id = auth.uid()
  ));
