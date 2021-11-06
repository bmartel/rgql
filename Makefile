dgraph:
	docker-compose -f graphql/docker-compose.yml up -d

envfile:
	./scripts/env.sh

schema:
	yarn schema

migrate:
	./scripts/migrate.sh

graphiql:
	npx serve -p 8081 -s graphql

cleanup:
	docker-compose -f graphql/docker-compose.yml down -v

setup: envfile schema dgraph migrate

dev: setup
	yarn dev

prod: setup
	yarn build
	yarn start
