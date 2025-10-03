#!/bin/sh
set -e
"${DATABASE_URL:?DATABASE_URL is required for PostgreSQL backup}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "📦 Starting database backup to $BACKUP_DIR ..."

# PostgreSQL
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/backup_$DATE.sql"
  echo "✅ PostgreSQL backup: $BACKUP_DIR/backup_$DATE.sql"
else
  echo "⚠️ pg_dump not found, skipping PostgreSQL backup"
fi

# Redis
if command -v redis-cli >/dev/2>&1; then
  redis-cli --rdb "$BACKUP_DIR/dump_$DATE.rdb"
  echo "✅ Redis backup: $BACKUP_DIR/dump_$DATE.rdb"
else
  echo "ℹ️ redis-cli not found, skipping Redis backup"
fi

echo "🎉 Backup complete"
