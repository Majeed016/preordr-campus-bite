
-- Add accepting_orders column to canteens table
ALTER TABLE public.canteens 
ADD COLUMN accepting_orders boolean NOT NULL DEFAULT true;
