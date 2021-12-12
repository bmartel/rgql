-- This script was generated by the Schema Diff utility in pgAdmin 4
-- For the circular dependencies, the order in which Schema Diff writes the objects is not very sophisticated
-- and may require manual changes to the script to ensure changes are applied in the correct order.
-- Please report an issue for any failure with the reproduction steps.

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF SECURITY DEFINER
AS $BODY$
begin
  insert into public.profile(id)
  values (new.id);

  return new;
end;
$BODY$;

ALTER FUNCTION public.create_profile_for_user()
    OWNER TO supabase_admin;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO anon;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO postgres;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO supabase_admin;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_profile_for_user() TO service_role;

CREATE TABLE IF NOT EXISTS public.profiles
(
    id uuid NOT NULL,
    updated_at timestamp with time zone,
    username text COLLATE pg_catalog."default",
    avatar_url text COLLATE pg_catalog."default",
    website text COLLATE pg_catalog."default",
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
        REFERENCES auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.profiles
    OWNER to supabase_admin;

ALTER TABLE IF EXISTS public.profiles
    ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.profiles TO anon;

GRANT ALL ON TABLE public.profiles TO authenticated;

GRANT ALL ON TABLE public.profiles TO postgres;

GRANT ALL ON TABLE public.profiles TO service_role;

GRANT ALL ON TABLE public.profiles TO supabase_admin;
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);
CREATE POLICY "Users can insert their own profile."
    ON public.profiles
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile."
    ON public.profiles
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING ((auth.uid() = id));
