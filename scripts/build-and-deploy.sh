#!/usr/bin/env bash
# ============================================================
# Mindforge — Build & Deploy Script for Local Server
# ============================================================
# Builds all frontends and backends, then starts everything
# with PM2 and optionally configures Apache httpd.
#
# Usage:
#   chmod +x scripts/build-and-deploy.sh
#   ./scripts/build-and-deploy.sh
#
# Flags:
#   --skip-install    Skip npm install
#   --skip-frontend   Skip frontend builds
#   --skip-backend    Skip backend builds
#   --backends-only   Only build and start backends
#   --frontends-only  Only build frontends
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[MINDFORGE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

SKIP_INSTALL=false
SKIP_FRONTEND=false
SKIP_BACKEND=false

for arg in "$@"; do
  case $arg in
    --skip-install)   SKIP_INSTALL=true ;;
    --skip-frontend)  SKIP_FRONTEND=true ;;
    --skip-backend)   SKIP_BACKEND=true ;;
    --backends-only)  SKIP_FRONTEND=true ;;
    --frontends-only) SKIP_BACKEND=true ;;
  esac
done

# ── Prerequisites Check ──────────────────────────────────────
log "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { err "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { err "npm is required."; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  err "Node.js >= 18 required (found v$(node -v))"
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  warn "PM2 not found. Installing globally..."
  npm install -g pm2
fi

info "Node.js $(node -v) | npm $(npm -v) | PM2 $(pm2 -v 2>/dev/null || echo 'installing...')"

# ── PostgreSQL Check ──────────────────────────────────────────
log "Checking PostgreSQL..."
if command -v pg_isready >/dev/null 2>&1; then
  if pg_isready -q 2>/dev/null; then
    info "PostgreSQL is running"
  else
    warn "PostgreSQL is not running. Start it with:"
    warn "  macOS:  brew services start postgresql@16"
    warn "  Linux:  sudo systemctl start postgresql"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || exit 1
  fi
else
  warn "pg_isready not found — cannot verify PostgreSQL status."
  warn "Make sure PostgreSQL is running on localhost:5432"
fi

# ── Database Setup ────────────────────────────────────────────
log "Ensuring databases exist..."
DB_USER="${DB_USERNAME:-prayash}"
for db in mindforge mindforge_admin mindforge_teacher mindforge_parent; do
  if command -v psql >/dev/null 2>&1; then
    psql -U "$DB_USER" -lqt 2>/dev/null | grep -qw "$db" || {
      info "Creating database: $db"
      createdb -U "$DB_USER" "$db" 2>/dev/null || warn "Could not create $db — create it manually"
    }
  fi
done

# ── Install Dependencies ──────────────────────────────────────
if [ "$SKIP_INSTALL" = false ]; then
  log "Installing dependencies (root workspace)..."
  npm install
fi

# ── Build Frontends ───────────────────────────────────────────
if [ "$SKIP_FRONTEND" = false ]; then
  log "Building frontends..."
  FRONTENDS=("student" "parent" "teacher" "admin")

  for app in "${FRONTENDS[@]}"; do
    FRONTEND_DIR="$ROOT_DIR/apps/$app/frontend"
    if [ -d "$FRONTEND_DIR" ]; then
      info "Building $app frontend..."
      cd "$FRONTEND_DIR"
      npm run build 2>&1 | tail -5
      if [ -d "dist" ]; then
        info "$app frontend → dist/ ($(du -sh dist | cut -f1))"
      else
        err "$app frontend build failed — no dist/ folder"
        exit 1
      fi
    else
      warn "$app frontend directory not found at $FRONTEND_DIR"
    fi
  done
  cd "$ROOT_DIR"
fi

# ── Build Backends ────────────────────────────────────────────
if [ "$SKIP_BACKEND" = false ]; then
  log "Building backends..."
  BACKENDS=("student" "parent" "teacher" "admin")

  for app in "${BACKENDS[@]}"; do
    BACKEND_DIR="$ROOT_DIR/apps/$app/backend"
    if [ -d "$BACKEND_DIR" ]; then
      info "Building $app backend..."
      cd "$BACKEND_DIR"
      npx nest build 2>&1 | tail -3
      if [ -f "dist/main.js" ]; then
        info "$app backend → dist/main.js"
      else
        err "$app backend build failed — no dist/main.js"
        exit 1
      fi
    else
      warn "$app backend directory not found at $BACKEND_DIR"
    fi
  done
  cd "$ROOT_DIR"
fi

# ── Start Backends with PM2 ──────────────────────────────────
log "Starting backends with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js

echo ""
log "PM2 Status:"
pm2 status

# ── Health Checks ─────────────────────────────────────────────
echo ""
log "Running health checks (waiting 5s for startup)..."
sleep 5

PORTS=("3000:Student" "3002:Parent" "3003:Teacher" "3004:Admin")
ALL_HEALTHY=true

for entry in "${PORTS[@]}"; do
  PORT="${entry%%:*}"
  NAME="${entry##*:}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/health" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    info "$NAME backend (port $PORT) — HEALTHY"
  else
    warn "$NAME backend (port $PORT) — HTTP $HTTP_CODE (may still be starting)"
    ALL_HEALTHY=false
  fi
done

# ── Get Server IP ─────────────────────────────────────────────
SERVER_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_SERVER_IP")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "BUILD & DEPLOY COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Backend APIs (accessible from any device on the network):"
echo "  Student : http://$SERVER_IP:3000"
echo "  Parent  : http://$SERVER_IP:3002"
echo "  Teacher : http://$SERVER_IP:3003"
echo "  Admin   : http://$SERVER_IP:3004"
echo ""
if [ "$SKIP_FRONTEND" = false ]; then
  info "To serve frontends via Apache httpd:"
  echo "  1. Install Apache: brew install httpd"
  echo "  2. Copy config: cp deploy/apache/mindforge.conf /opt/homebrew/etc/httpd/extra/"
  echo "  3. Edit /opt/homebrew/etc/httpd/httpd.conf and add:"
  echo "     Include /opt/homebrew/etc/httpd/extra/mindforge.conf"
  echo "  4. Restart: brew services restart httpd"
  echo ""
  info "Then access the apps at:"
  echo "  Landing : http://$SERVER_IP:8080"
  echo "  Student : http://$SERVER_IP:8001"
  echo "  Parent  : http://$SERVER_IP:8002"
  echo "  Teacher : http://$SERVER_IP:8003"
  echo "  Admin   : http://$SERVER_IP:8004"
fi
echo ""
info "Useful PM2 commands:"
echo "  pm2 status       — View process status"
echo "  pm2 logs         — View all logs"
echo "  pm2 logs mindforge-student — View student logs"
echo "  pm2 restart all  — Restart all services"
echo "  pm2 stop all     — Stop all services"
echo "  pm2 save         — Save process list (auto-start on reboot)"
echo "  pm2 startup      — Generate startup script"
echo ""
