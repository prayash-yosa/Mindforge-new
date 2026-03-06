# Mindforge — Local Server Deployment Guide

Deploy the complete Mindforge platform (4 web apps + 4 API backends + PostgreSQL) on a local server accessible by any device on the network via IP address.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL SERVER (your machine)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Apache HTTP Server (httpd)                               │   │
│  │  Serves static frontend files + proxies API requests      │   │
│  │                                                           │   │
│  │  :8080  → Landing Page                                    │   │
│  │  :8001  → Student frontend  ──→ /v1/* → :3000 backend     │   │
│  │  :8002  → Parent frontend   ──→ /v1/* → :3002 backend     │   │
│  │  :8003  → Teacher frontend  ──→ /v1/* → :3003 backend     │   │
│  │  :8004  → Admin frontend    ──→ /v1/* → :3004 backend     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PM2 Process Manager                                      │   │
│  │  :3000  mindforge-student  (NestJS)                       │   │
│  │  :3002  mindforge-parent   (NestJS)                       │   │
│  │  :3003  mindforge-teacher  (NestJS)                       │   │
│  │  :3004  mindforge-admin    (NestJS)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16                                            │   │
│  │  :5432                                                    │   │
│  │  Databases: mindforge, mindforge_admin,                   │   │
│  │             mindforge_teacher, mindforge_parent            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

     Other devices on the network access via:
     http://192.168.x.x:8080  (landing page)
     http://192.168.x.x:8001  (student app)
     etc.
```

---

## Prerequisites

| Software | Version | Install Command |
|----------|---------|-----------------|
| Node.js  | >= 18   | `brew install node` or [nodejs.org](https://nodejs.org) |
| npm      | >= 10   | Comes with Node.js |
| PostgreSQL | >= 14 | `brew install postgresql@16` |
| PM2      | latest  | `npm install -g pm2` |
| Apache httpd | >= 2.4 | `brew install httpd` (macOS) / `sudo apt install apache2` (Ubuntu) |

---

## Step 1: PostgreSQL Setup

### Install and Start PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Databases

```bash
# macOS default user is your OS username; Linux default is 'postgres'
# Replace 'prayash' with your PostgreSQL username

createdb -U prayash mindforge
createdb -U prayash mindforge_admin
createdb -U prayash mindforge_teacher
createdb -U prayash mindforge_parent
```

### Verify Databases

```bash
psql -U prayash -l
```

You should see all 4 databases listed.

### Configure for Network Access (optional — for remote PostgreSQL)

If PostgreSQL runs on a different machine, edit `postgresql.conf`:
```
listen_addresses = '*'
```

And in `pg_hba.conf`, add:
```
host    all    all    192.168.0.0/16    md5
```

Then restart PostgreSQL.

---

## Step 2: Configure Backend Environment

Each backend needs a `.env` file. Create/update them:

### Student Backend
```bash
# apps/student/backend/.env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=prayash
DB_PASSWORD=
DB_NAME=mindforge
```

### Parent Backend
```bash
# apps/parent/backend/.env
NODE_ENV=production
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=prayash
DB_PASSWORD=
DB_NAME=mindforge_parent
```

### Teacher Backend
```bash
# apps/teacher/backend/.env
NODE_ENV=production
TEACHER_SERVICE_PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=prayash
DB_PASSWORD=
DB_NAME=mindforge_teacher
```

### Admin Backend
```bash
# apps/admin/backend/.env
NODE_ENV=production
ADMIN_SERVICE_PORT=3004
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=prayash
DB_PASSWORD=
DB_NAME=mindforge_admin
```

> **Note:** Replace `prayash` with your actual PostgreSQL username. On macOS with Homebrew PostgreSQL, the default user is your OS username with no password.

---

## Step 3: Build Everything

### Quick Method (automated script)

```bash
chmod +x scripts/build-and-deploy.sh
./scripts/build-and-deploy.sh
```

This script will:
1. Check prerequisites (Node.js, PostgreSQL, PM2)
2. Create databases if they don't exist
3. Install dependencies
4. Build all 4 frontends (Vite → `dist/`)
5. Build all 4 backends (NestJS → `dist/main.js`)
6. Start all backends with PM2
7. Run health checks

### Manual Method (step by step)

```bash
# From project root
cd /Users/prayash/Project/Mindforge

# Install all dependencies
npm install

# Build frontends
cd apps/student/frontend && npm run build && cd ../../..
cd apps/parent/frontend  && npm run build && cd ../../..
cd apps/teacher/frontend && npm run build && cd ../../..
cd apps/admin/frontend   && npm run build && cd ../../..

# Build backends
cd apps/student/backend && npx nest build && cd ../../..
cd apps/parent/backend  && npx nest build && cd ../../..
cd apps/teacher/backend && npx nest build && cd ../../..
cd apps/admin/backend   && npx nest build && cd ../../..
```

### Verify Builds

```bash
# Frontends — each should have a dist/ folder
ls apps/student/frontend/dist/index.html
ls apps/parent/frontend/dist/index.html
ls apps/teacher/frontend/dist/index.html
ls apps/admin/frontend/dist/index.html

# Backends — each should have dist/main.js
ls apps/student/backend/dist/main.js
ls apps/parent/backend/dist/main.js
ls apps/teacher/backend/dist/main.js
ls apps/admin/backend/dist/main.js
```

---

## Step 4: Start Backends with PM2

```bash
# From project root
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Save process list (survives reboots after running 'pm2 startup')
pm2 save
pm2 startup   # Follow the printed command to enable auto-start on reboot
```

### Verify Backends Are Running

```bash
curl http://localhost:3000/health   # Student
curl http://localhost:3002/health   # Parent (may be at /v1/health)
curl http://localhost:3003/health   # Teacher (may be at /v1/health)
curl http://localhost:3004/health   # Admin
```

---

## Step 5: Configure Apache HTTP Server

> **Important:** You need **Apache HTTP Server (httpd)**, NOT Apache Tomcat. Tomcat is a Java servlet container and is not suitable for Node.js/React applications. Apache httpd is a general-purpose web server that can serve static files and proxy API requests.

### Install Apache httpd

**macOS (Homebrew):**
```bash
brew install httpd
```

**Ubuntu/Debian:**
```bash
sudo apt install apache2
```

### Enable Required Modules

**macOS (Homebrew):**

Edit `/opt/homebrew/etc/httpd/httpd.conf` and uncomment these lines (remove the `#`):
```apache
LoadModule proxy_module lib/httpd/modules/mod_proxy.so
LoadModule proxy_http_module lib/httpd/modules/mod_proxy_http.so
LoadModule rewrite_module lib/httpd/modules/mod_rewrite.so
LoadModule headers_module lib/httpd/modules/mod_headers.so
```

**Ubuntu/Debian:**
```bash
sudo a2enmod proxy proxy_http rewrite headers
```

### Install Mindforge Apache Config

**macOS (Homebrew):**
```bash
# Copy config
cp deploy/apache/mindforge.conf /opt/homebrew/etc/httpd/extra/

# Update the MINDFORGE_ROOT path in the config if needed
# Edit /opt/homebrew/etc/httpd/extra/mindforge.conf
# Change: Define MINDFORGE_ROOT /Users/prayash/Project/Mindforge

# Add to httpd.conf (at the end of the file)
echo 'Include /opt/homebrew/etc/httpd/extra/mindforge.conf' >> /opt/homebrew/etc/httpd/httpd.conf

# Start/restart Apache
brew services restart httpd
```

**Ubuntu/Debian:**
```bash
# Copy config
sudo cp deploy/apache/mindforge.conf /etc/apache2/sites-available/

# Update the MINDFORGE_ROOT path
sudo nano /etc/apache2/sites-available/mindforge.conf
# Change: Define MINDFORGE_ROOT /home/your-user/Mindforge

# Enable the site
sudo a2ensite mindforge
sudo a2dissite 000-default   # Disable default site

# Restart
sudo systemctl restart apache2
```

### Verify Apache is Running

```bash
# macOS
brew services list | grep httpd

# Ubuntu
sudo systemctl status apache2

# Test
curl http://localhost:8080
```

---

## Step 6: Find Your Server IP

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

---

## Step 7: Access From Any Device

Open a browser on any device connected to the same network:

| App | URL | Description |
|-----|-----|-------------|
| Landing Page | `http://SERVER_IP:8080` | Links to all apps |
| Student | `http://SERVER_IP:8001` | Student dashboard, activities, results |
| Parent | `http://SERVER_IP:8002` | Child progress, fees, attendance |
| Teacher | `http://SERVER_IP:8003` | Classes, syllabus, tests, analytics |
| Admin | `http://SERVER_IP:8004` | User management, fees, payments |

Replace `SERVER_IP` with the IP address from Step 6 (e.g., `192.168.1.100`).

---

## Port Reference

| Port | Service |
|------|---------|
| 5432 | PostgreSQL |
| 3000 | Student Backend (NestJS) |
| 3002 | Parent Backend (NestJS) |
| 3003 | Teacher Backend (NestJS) |
| 3004 | Admin Backend (NestJS) |
| 8001 | Student Web App (Apache → frontend + API proxy) |
| 8002 | Parent Web App (Apache → frontend + API proxy) |
| 8003 | Teacher Web App (Apache → frontend + API proxy) |
| 8004 | Admin Web App (Apache → frontend + API proxy) |
| 8080 | Landing Page (Apache) |

---

## Firewall Configuration

If other devices can't access your server, you may need to open the ports.

**macOS:** Firewall settings are in System Settings → Network → Firewall. Add exceptions for ports 8001-8004, 8080.

**Ubuntu:**
```bash
sudo ufw allow 8001:8004/tcp
sudo ufw allow 8080/tcp
```

---

## Management Commands

### PM2 (Backend Process Manager)

```bash
pm2 status                          # View all process status
pm2 logs                            # View all logs (live)
pm2 logs mindforge-student          # View student backend logs
pm2 restart all                     # Restart all backends
pm2 restart mindforge-admin         # Restart only admin
pm2 stop all                        # Stop all backends
pm2 delete all                      # Remove all processes
pm2 monit                           # Real-time monitoring dashboard
```

### Apache httpd

```bash
# macOS
brew services start httpd            # Start
brew services stop httpd             # Stop
brew services restart httpd          # Restart
httpd -t                             # Test config syntax

# Ubuntu
sudo systemctl start apache2
sudo systemctl stop apache2
sudo systemctl restart apache2
sudo apache2ctl configtest           # Test config syntax
```

### PostgreSQL

```bash
# macOS
brew services start postgresql@16
brew services stop postgresql@16
psql -U prayash -l                   # List databases

# Ubuntu
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo -u postgres psql -l             # List databases
```

---

## Troubleshooting

### Backend won't start — ECONNREFUSED on port 5432
PostgreSQL isn't running. Start it:
```bash
brew services start postgresql@16    # macOS
sudo systemctl start postgresql      # Ubuntu
```

### Apache — "Address already in use"
Another process is using the port. Find it:
```bash
lsof -i :8080    # Find what's on port 8080
kill <PID>        # Kill the process
```

### "Cannot GET /" on Apache ports
Frontend hasn't been built. Run:
```bash
cd apps/student/frontend && npm run build
# (repeat for other apps)
```
Then restart Apache.

### API calls return 502 Bad Gateway
Backend is not running. Check PM2:
```bash
pm2 status
pm2 logs
```

### Database migration errors on startup
Run migrations manually:
```bash
cd apps/student/backend
npx typeorm migration:run -d src/database/data-source.ts
```

### Devices on the network can't connect
1. Check firewall settings
2. Verify the server IP: `ipconfig getifaddr en0` (macOS) or `hostname -I` (Linux)
3. Ensure devices are on the same network/subnet

---

## Quick Start (TL;DR)

```bash
# 1. Install prerequisites
brew install node postgresql@16 httpd
npm install -g pm2
brew services start postgresql@16

# 2. Create databases
createdb mindforge
createdb mindforge_admin
createdb mindforge_teacher
createdb mindforge_parent

# 3. Build and deploy
cd /Users/prayash/Project/Mindforge
chmod +x scripts/build-and-deploy.sh
./scripts/build-and-deploy.sh

# 4. Configure Apache (one-time)
cp deploy/apache/mindforge.conf /opt/homebrew/etc/httpd/extra/
echo 'Include /opt/homebrew/etc/httpd/extra/mindforge.conf' >> /opt/homebrew/etc/httpd/httpd.conf
# Enable required modules in /opt/homebrew/etc/httpd/httpd.conf (uncomment proxy lines)
brew services restart httpd

# 5. Access
# http://YOUR_IP:8080 (landing page)
```
