# Causeway Books — build & serve
#
#   make        build the site into dist/
#   make start  build, then serve dist/ at http://localhost:8788 (background)
#   make stop   stop the background server
#   make deploy publish dist/ to Cloudflare Pages (needs `wrangler login` once)

PORT ?= 8788
PID_FILE := .server.pid
LOG_FILE := .server.log

.PHONY: all build start stop deploy clean

all: build

node_modules: package.json
	npm install
	@touch node_modules

build: node_modules
	npm run build

start: build stop
	@PORT=$(PORT) nohup npx tsx src/serve.ts >> $(LOG_FILE) 2>&1 &
	@sleep 2
	@if [ -f $(PID_FILE) ]; then \
		echo "Causeway Books open at http://localhost:$(PORT) (pid `cat $(PID_FILE)`)"; \
	else \
		echo "server failed to start — see $(LOG_FILE)"; exit 1; \
	fi

stop:
	@if [ -f $(PID_FILE) ]; then \
		kill `cat $(PID_FILE)` 2>/dev/null || true; \
		rm -f $(PID_FILE); \
		echo "server stopped"; \
	else \
		echo "server not running"; \
	fi

deploy: build
	npx wrangler pages deploy dist --project-name=causeway-books

clean: stop
	rm -rf dist $(LOG_FILE)
