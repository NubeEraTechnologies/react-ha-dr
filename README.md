# 🏗️ HA Demo — React + Node.js + PostgreSQL

A complete High Availability (HA), Fault Tolerant (FT), and Disaster Recovery (DR) demo running on **Docker Compose**, using:

* **React (static frontend)**
* **Node.js / Express (backend API)**
* **PostgreSQL (database)**
* **Nginx (reverse proxy + routing)**

This project demonstrates:

✔ Containerized frontend + backend + database
✔ Load-balanced backend replicas
✔ Auto restart + health checks
✔ Persistent DB volume
✔ Backup system for DR
✔ Service isolation using Docker networks

---

# 📂 Project Structure

```
react-ha-dr/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   └── build/index.html
├── nginx/
│   ├── Dockerfile
│   └── default.conf
└── docker-compose.yml
```

---

# 🚀 Getting Started

## 1️⃣ Install Docker & Docker Compose

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release

mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker $USER
```

Logout/login to apply Docker group permissions.

---

# 2️⃣ Clone / Create the Project

```bash
git clone https://github.com/NubeEraTechnologies/react-ha-dr.git
mkdir -p ~/react-ha-dr
cd ~/react-ha-dr
```

Place all code files inside the appropriate folders.

---

# 3️⃣ Build & Run All Containers

```bash
docker compose build
docker compose up -d
```

### Scale backend (HA)

```bash
docker compose up -d --scale backend=2
```

---

# 4️⃣ Verify Running Services

```bash
docker compose ps
docker ps
```

Expected services:

* **nginx**
* **frontend**
* **backend-1**
* **backend-2**
* **postgres**

---

# 5️⃣ Access the App

Open in browser:

```
http://<VM_PUBLIC_IP>/
```

You should see:

```
HA Demo - React Frontend
API Result: Hello from Node @ <timestamp>
```

---

# ⚙️ Service Details

## **Frontend (React Static Build)**

Served by **Nginx static hosting** using:

```
frontend/Dockerfile
frontend/build/index.html
```

---

## **Backend (Node.js API)**

Listens on port `4000` inside the container.
Connected to PostgreSQL using environment variable:

```
DATABASE_URL=postgres://postgres:postgres@postgres:5432/postgres
```

---

## **Nginx Reverse Proxy**

Routes:

```
/      → frontend
/api   → backend
```

Config file: `nginx/default.conf`

---

## **PostgreSQL Database**

Containerized with persistent volume:

```
volumes:
  - pgdata:/var/lib/postgresql/data
```

Runs health check using `pg_isready`.

---

# 🔁 Health Checks & Restart Policies

Each service (except frontend) has:

```
restart: unless-stopped
```

Backend and Postgres have health checks configured inside `docker-compose.yml`.

---

# 🛠️ Useful Commands

### Show logs

```bash
docker compose logs -f backend
docker compose logs -f nginx
```

### Restart all

```bash
docker compose down
docker compose up -d
```

### Stop individual service

```bash
docker stop <container_name>
```

---
# **8. Set Up Backups (DR Step)**

Create folder:

```bash
sudo mkdir -p /opt/pg_backups
```

Create backup script `/opt/pg_backups/backup.sh`:

```bash
#!/bin/bash
set -e

OUTDIR=/opt/pg_backups/$(date +%F)
mkdir -p "$OUTDIR"

docker exec $(docker ps -q -f name=postgres) \
  pg_dump -U postgres -F c postgres > "$OUTDIR/db.dump"

gzip "$OUTDIR/db.dump"

find /opt/pg_backups -maxdepth 1 -type d -mtime +7 -exec rm -rf {} +
```

Make it executable:

```bash
sudo chmod +x /opt/pg_backups/backup.sh
```

Add cron:

```bash
sudo crontab -e
```

Add line:

```
0 2 * * * /opt/pg_backups/backup.sh >> /var/log/pg_backup.log 2>&1
```

# 📦 Backup & Disaster Recovery

A backup script can be placed at:

```
/opt/pg_backups/backup.sh
```

Run manually:

```bash
sudo /opt/pg_backups/backup.sh
```

Cronjob (daily at 2 AM):

```
0 2 * * * /opt/pg_backups/backup.sh >> /var/log/pg_backup.log 2>&1
```

Backups stored in:

```
/opt/pg_backups/YYYY-MM-DD/db.dump.gz
```
### ✔ First, manually trigger a backup:

```bash
sudo /opt/pg_backups/backup.sh
```

Then check backup folder:

```bash
ls -R /opt/pg_backups
```

You should see something like:

```
2025-11-25/
   db.dump.gz
```

### ✔ Now you can decompress with:

```bash
gunzip /opt/pg_backups/<folder-name>/db.dump.gz
```

Example:

```bash
gunzip /opt/pg_backups/2025-11-25/db.dump.gz
```
---

# 🧪 Failure Testing

### Kill backend replicas

```bash
docker kill $(docker ps -q -f name=backend)
```

Backend replicas will auto-restart.

---

### Stop Postgres

(Replace name with real container name)

```bash
docker stop react-ha-dr-postgres-1
```
