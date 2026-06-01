#!/usr/bin/env bash
# save_versions.sh – creates a timestamped snapshot of the project files
# Usage: ./save_versions.sh

# Root of the project (adjust if run from a different directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Directory to store snapshots
SNAPSHOT_DIR="$PROJECT_ROOT/versions"
# Create snapshot directory if it doesn't exist
mkdir -p "$SNAPSHOT_DIR"

# Timestamp for version naming (YYYYMMDD_HHMMSS)
TS=$(date +"%Y%m%d_%H%M%S")

# Function to copy a file with version suffix
copy_with_version() {
  local src="$1"
  local relPath="${src#$PROJECT_ROOT/}"   # relative path within project
  local dir="$(dirname "$relPath")"
  local base="$(basename "$relPath")"
  local name="${base%.*}"   # filename without extension
  local ext="${base##*.}"   # extension
  if [ "$name" = "$ext" ]; then
    # file without extension (e.g., .gitignore)
    dest="$SNAPSHOT_DIR/${relPath}_v${TS}"
  else
    dest="$SNAPSHOT_DIR/${dir}/${name}_v${TS}.${ext}"
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "Saved $src → $dest"
}

# Recursively find all files (excluding node_modules and .git directories)
find "$PROJECT_ROOT" -type f \( -path "*/node_modules/*" -o -path "*/.git/*" \) -prune -o -type f -print | while read -r file; do
  copy_with_version "$file"
done

echo "Snapshot completed. All versioned files are in $SNAPSHOT_DIR"
