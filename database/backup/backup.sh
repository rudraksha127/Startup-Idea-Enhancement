# MongoDB Backup Automation Script (Linux / macOS)
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/$TIMESTAMP"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/agencyos}"

echo "Starting AgencyOS MongoDB backup at $TIMESTAMP..."
mkdir -p "$BACKUP_DIR"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR" --gzip

echo "Backup completed successfully to $BACKUP_DIR"
