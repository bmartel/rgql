dgraph:
	docker-compose -f graphql/docker-compose.yml up -d

migrate:
	curl -X POST localhost:8080/admin/schema --data-binary '@graphql/schema.graphql'

graphiql:
	npx serve -p 8081 -s graphql

cleanup:
	docker-compose -f graphql/docker-compose.yml down -v

setup: dgraph migrate

dev: setup
	yarn dev

prod: setup
	yarn build
	yarn start
