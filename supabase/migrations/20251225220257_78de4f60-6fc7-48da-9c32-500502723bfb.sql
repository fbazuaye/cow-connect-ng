-- Drop the foreign key constraint on vendors to allow demo data
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_fkey