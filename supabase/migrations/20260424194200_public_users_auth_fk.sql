-- Tie public.users to auth.users.
-- When a Supabase Auth user is deleted (via supabase.auth.admin.deleteUser or
-- from the Supabase dashboard), the matching public.users row is cascade-
-- deleted too. This keeps our user directory in sync with the auth directory
-- without any application code on the delete path.

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_id_auth_fk"
  FOREIGN KEY ("id")
  REFERENCES "auth"."users"("id")
  ON DELETE CASCADE;
