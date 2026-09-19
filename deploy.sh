#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose"

# Fail early with a clear message if the shared Traefik network is missing.
if ! docker network inspect web >/dev/null 2>&1; then
  echo "✗ External Docker network 'web' not found."
  echo "  Create it (it is the network Traefik routes on):"
  echo "    docker network create web"
  exit 1
fi


echo "╔══════════════════════════════════════════╗"
echo "║      Word Search — Deploy Script        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

echo "→ Pulling latest changes..."
git pull

echo ""
echo "→ Building and starting container..."
$COMPOSE up -d --build

echo ""
echo "→ Waiting for the app to be healthy..."
# A real GET (not --spider/HEAD), against 127.0.0.1 — inside the container
# `localhost` resolves to IPv6 ::1 but Next only listens on IPv4, so always
# use 127.0.0.1 here.
health_url="http://127.0.0.1:3000/"
timeout=120
elapsed=0
healthy=0
last_err=""
while [ $elapsed -lt $timeout ]; do
  if last_err=$($COMPOSE exec -T word-search wget -q -O /dev/null "$health_url" 2>&1); then
    healthy=1
    break
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

# Fallback: ask the container from the HOST over the same network Traefik
# routes on. If the in-container check is flaky for some reason but the app
# is genuinely serving (Traefik would prove it), the deploy still succeeds.
if [ $healthy -eq 0 ]; then
  cid=$($COMPOSE ps -q word-search)
  cnet_ip=$(docker inspect -f '{{(index .NetworkSettings.Networks "web").IPAddress}}' "$cid" 2>/dev/null || true)
  if [ -n "$cnet_ip" ] && last_err2=$(curl -fsS -o /dev/null "http://${cnet_ip}:3000/" 2>&1); then
    healthy=2
    last_err="in-container check failed (${last_err:-no output}) but host -> ${cnet_ip}:3000 OK"
  else
    last_err="${last_err:-no output} ; host -> ${cnet_ip:-<no container ip>}:3000 also failed (${last_err2:-curl error})"
  fi
fi

if [ $healthy -eq 1 ]; then
  echo "  ✓ App is healthy (after ${elapsed}s)"
elif [ $healthy -eq 2 ]; then
  echo "  ⚠ In-container check failed, but the app answers over the Traefik network — treating as healthy."
  echo "    ${last_err}"
else
  echo "  ✗ App did not become healthy within ${timeout}s"
  echo "  --- healthcheck errors ---"
  echo "  ${last_err}"
  echo "  --- container status ---"
  $COMPOSE ps --format "table {{.Name}}\t{{.Status}}"
  echo "  --- last 30 log lines ---"
  $COMPOSE logs --tail 30 word-search 2>&1 | sed 's/^/  /'
  exit 1
fi

echo ""
echo "→ Cleaning up dangling images..."
docker image prune -f | tail -1
echo "→ Cleaning up build cache (keeping 2GB)..."
docker builder prune -f --keep-storage=2GB | tail -1

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        Deploy Complete!                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Services:"
$COMPOSE ps --format "table {{.Name}}\t{{.Status}}"
echo ""
