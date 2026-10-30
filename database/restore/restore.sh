# MongoDB Restore Automation Script (Linux / macOS)
set -e

BACKUP_PATH="$1"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/agencyos}"

if [ -z "$BACKUP_PATH" ]; then
  echo "Usage: ./restore.sh <path-to-backup-dir>"
  exit 1
fi

echo "Restoring AgencyOS MongoDB from $BACKUP_PATH..."
mongorestore --uri="$MONGODB_URI" --gzip "$BACKUP_PATH"

echo "Restore completed successfully."

