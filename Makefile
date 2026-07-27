# Makefile — convenience wrapper around the scripts/ directory and Docker
# Compose, so every developer runs the same commands regardless of shell
# preference. Mirrors package.json scripts for Node tooling. See
# docs/34_Developer_Guide.md for the full workflow this automates.
#
# Usage: make <target>   (run `make help` to list all targets)

SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help setup install update clean bootstrap \
        dev prod up down logs \
        test test-unit test-integration test-coverage \
        lint format typecheck \
        seed reset-db backup restore \
        docs docs-api docs-erd \
        onboard validate-env health-check

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

## --- Setup & Lifecycle ---------------------------------------------------

setup: ## First-time repository setup (installs deps, copies .env, builds images)
	@bash scripts/setup.sh

install: ## Install/reinstall all dependencies (Node workspaces + Python venvs)
	@bash scripts/install.sh

update: ## Update dependencies across all services
	@bash scripts/update-dependencies.sh

clean: ## Remove build artifacts, caches, and stopped containers
	@bash scripts/clean.sh

bootstrap: setup validate-env ## Full bootstrap: setup + environment validation
	@echo "Bootstrap complete. Run 'make dev' to start the stack."

## --- Running the Stack -----------------------------------------------------

dev: ## Start the full local stack (infra + app services) in dev mode with hot reload
	@bash scripts/run-dev.sh

prod: ## Start the stack using the production-like compose overlay
	@bash scripts/run-production.sh

up: ## Start infra-only services (db, redis, kafka, minio, geoserver)
	docker compose -f docker/docker-compose.yml up -d

down: ## Stop all running containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

logs: ## Tail logs from all running containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f --tail=200

## --- Testing & Quality ------------------------------------------------------

test: ## Run all tests (unit + integration) across every service
	@bash scripts/run-tests.sh

test-unit: ## Run unit tests only
	@bash scripts/run-tests.sh --unit-only

test-integration: ## Run integration tests only (spins up Testcontainers)
	@bash scripts/run-tests.sh --integration-only

test-coverage: ## Run tests with coverage report
	@bash scripts/run-tests.sh --coverage

lint: ## Lint all TypeScript/Python code
	npm run lint
	ruff check .

format: ## Auto-format all code
	npm run format
	ruff format .

typecheck: ## Type-check all TypeScript/Python code
	npm run typecheck
	mypy .

## --- Database ---------------------------------------------------------------

seed: ## Seed the local database with mock-data/
	@bash scripts/seed-database.sh

reset-db: ## Drop and recreate the local database from migrations + seeds
	@bash scripts/reset-database.sh

backup: ## Back up the local database
	@bash scripts/backup.sh

restore: ## Restore the local database from the latest backup
	@bash scripts/restore.sh

## --- Documentation ------------------------------------------------------------

docs: ## Regenerate all generated documentation
	@bash scripts/generate-docs.sh

docs-api: ## Regenerate API docs/SDKs from docs/api/openapi.yaml
	@bash scripts/generate-api-docs.sh

docs-erd: ## Regenerate ERD image exports from docs/07_ERD.md / docs/diagrams/06_Complete_ERD.md
	@bash scripts/generate-erd.sh

## --- Developer Experience -----------------------------------------------------

onboard: ## Run the interactive new-developer onboarding script
	@bash scripts/onboarding.sh

validate-env: ## Validate that .env / tool versions match project requirements
	@bash scripts/validate-environment.sh

health-check: ## Run the repository health-check script (drift, stale deps, broken links)
	@bash scripts/repo-health-check.sh
