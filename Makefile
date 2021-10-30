migrate:
	yarn prisma:migrate 

data:
	docker-compose -f graphql/docker-compose.yml up -d

setup: data migrate

dev: setup
	yarn dev

prod: setup
	yarn build
	yarn start
