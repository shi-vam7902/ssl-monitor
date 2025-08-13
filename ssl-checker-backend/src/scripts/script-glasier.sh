#!/bin/bash

# INPUT PARAMETERS
CONTAINER_NAME=$1
START_TIME=$2
END_TIME=$3

# Validate inputs
if [ -z "$CONTAINER_NAME" ] || [ -z "$START_TIME" ] || [ -z "$END_TIME" ]; then
  echo "Usage: ./backup-container-logs.sh <container_name> <start_time> <end_time>"
  exit 1
fi

# Output log file path
LOG_DIR="/home/readonly/logs"
mkdir -p "$LOG_DIR"

FILENAME="${CONTAINER_NAME}_$(date +%Y-%m-%d_%H-%M-%S).log"
LOG_FILE="$LOG_DIR/$FILENAME"

# Fetch docker logs and save
docker logs --since="$START_TIME" --until="$END_TIME" "$CONTAINER_NAME" > "$LOG_FILE" 2>&1

echo "Logs saved to $LOG_FILE"
