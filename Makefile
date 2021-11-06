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

install:
	yarn install

types:
	yarn graphql:types

setup: install envfile schema dgraph migrate types

pwa:
	npx pwa-asset-generator $(SVG_PATH) ./public/icons --manifest=./public/manifest.json --path-override=/icons --quality=80 --opaque=false --mstile --favicon --portrait-only --xhtml  

dev: setup
	yarn dev

prod: setup
	yarn build
	yarn start
