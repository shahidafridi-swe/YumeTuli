# YumeTuli — one entry point for humans and agents. Everything runs in Docker.
# `make help` lists targets. `make check` is the quality gate: run it before every commit.

COMPOSE := docker compose
API     := $(COMPOSE) exec -T api
WEB     := $(COMPOSE) exec -T web
ENGINE  := $(COMPOSE) exec -T -w /engine worker

.DEFAULT_GOAL := help
.PHONY: help up down restart logs ps dev check lint fmt typecheck test test-api migrate seed \
        restart-worker ui-check db-readonly-user shell-api shell-worker

help: ## List targets
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':.*?## ' '{printf "  \033[1m%-18s\033[0m %s\n", $$1, $$2}'

up: ## Start the whole stack and wait until healthy
	$(COMPOSE) up -d --wait

down: ## Stop the stack (volumes are kept)
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

dev: up ## Alias for `up`, then show where things are
	@echo "web http://localhost:3000 · api http://localhost:8000/api/v1/health · reverb ws://localhost:8080"

logs: ## Follow logs (S=service to pick one, e.g. make logs S=worker)
	$(COMPOSE) logs -f --tail=100 $(S)

ps: ## Service status
	$(COMPOSE) ps

check: lint typecheck test ## Quality gate: lint + typecheck + tests (run before committing)
	@echo "✓ make check passed"

lint: ## Pint (PHP style, check only) + ESLint (web)
	$(API) vendor/bin/pint --test
	$(WEB) npx eslint src

fmt: ## Auto-format PHP with Pint
	$(API) vendor/bin/pint

typecheck: ## tsc for web and engine
	$(WEB) npx tsc --noEmit
	$(ENGINE) npx tsc --noEmit

test: test-api ## All automated tests

test-api: ## Laravel tests (sqlite in memory, fake storage, fake Claude). F=filter
	$(API) php artisan test $(if $(F),--filter=$(F),)

migrate: ## Run database migrations
	$(API) php artisan migrate --force

seed: ## Owner account + house projects/series (safe to re-run)
	$(API) php artisan db:seed --force

restart-worker: ## Reload PHP code in the queue worker (needed after PHP changes)
	$(COMPOSE) restart worker

ui-check: ## Screenshots light/dark/mobile into out/ui-check (P="/ /videos", needs google-chrome)
	@bash scripts/ui-check.sh $(or $(P),/ /videos /projects /settings)

db-readonly-user: ## Create/refresh the SELECT-only MySQL user used by the MySQL MCP server
	@bash scripts/db-readonly-user.sh

shell-api: ## Shell in the api container
	$(COMPOSE) exec api bash

shell-worker: ## Shell in the worker container (engine at /engine)
	$(COMPOSE) exec worker bash
