migrate:
	supabase db push

# https://supabase.com/docs/guides/local-development
# https://github.com/supabase/cli/blob/main/examples/tour/README.md
# supabase init
# supabase db remote set 'postgresql://postgres:<your_password>@db.<your_project_ref>.supabase.co:5432/postgres'
# supabase db remote commit
init:
	supabase init

data:
	supabase start

setup: init data migrate
setup-prod: init data migrate

dev: setup
	yarn dev

prod: setup-prod
	yarn build
	yarn start
