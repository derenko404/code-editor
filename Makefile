.PHONY: build dev docker

build:
	@echo "running build ⌛"
	@rm ./bin/main
	@go build -o ./bin/main ./cmd/main.go 
	@echo "done ✅"

dev:
	air .

docker:
	docker-compose build
	docker-compose up -d

start-backend:
	@make docker
	@make dev

start-frontend:
	@cd ./client && npm run dev