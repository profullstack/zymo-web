#!/bin/bash

# Load environment variables
. .env
. .env.local

# Define the migration history table
MIGRATION_TABLE="migration_history"

# Function to initialize the migration history table
initialize_migration_table() {
  DATA="DEFINE TABLE ${MIGRATION_TABLE} SCHEMAFULL
        PERMISSIONS
          FOR select FULL,
          FOR update, delete, create FULL;
        DEFINE FIELD collection ON ${MIGRATION_TABLE} TYPE string;
        DEFINE FIELD version ON ${MIGRATION_TABLE} TYPE int;
        DEFINE FIELD createdAt ON ${MIGRATION_TABLE} TYPE datetime;
        DEFINE FIELD direction ON ${MIGRATION_TABLE} TYPE string;
        DEFINE INDEX idx_collection_version ON ${MIGRATION_TABLE} COLUMNS collection, version, direction UNIQUE;"

  echo "Executing INIT: ${DATA}"

  curl -k -L -s --compressed POST \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    --data "${DATA}" \
    ${DB_SQL_URL}

  echo "Migration history table initialized."
}

# Function to get the latest migration version and direction for a specific collection
get_latest_version_and_direction() {
  local collection="$1"

  # Fetch the latest migration record for the given collection
  LATEST=$(curl -k -L -s --compressed GET \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    "${DB_SQL_URL}/select * from ${MIGRATION_TABLE} WHERE collection = '${collection}' ORDER BY createdAt DESC, version DESC LIMIT 1")

#   echo "Latest migration record fetched: $LATEST"

  LATEST_VERSION=$(echo "$LATEST" | jq -r '.[0].version')
  LATEST_DIRECTION=$(echo "$LATEST" | jq -r '.[0].direction')

  # Fallback to default values if no valid record is found
  if [[ "$LATEST_VERSION" == "null" || -z "$LATEST_VERSION" ]]; then
    LATEST_VERSION=0
  fi

  if [[ "$LATEST_DIRECTION" == "null" || -z "$LATEST_DIRECTION" ]]; then
    LATEST_DIRECTION="none"
  fi

  # Correctly output the values so they can be read by the read command
  echo "$LATEST_VERSION $LATEST_DIRECTION"
}

# Function to apply a migration up for a specific collection
migrate_up() {
  local collection="$1"
  local VERSION=$2
  local TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")  # ISO 8601 UTC format
  local UP_FILE="./migrations/scripts/${collection}/${VERSION}.up.query"

  if [ ! -f "${UP_FILE}" ]; then
    echo "Migration file ${UP_FILE} does not exist."
    exit 1
  fi

  DATA=$(<"${UP_FILE}")

  echo "Executing UP migration for collection '${collection}' version '${VERSION}': ${DATA}"

  curl -k -L -s --compressed POST \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    --data "${DATA}" \
    ${DB_SQL_URL}

  # Record the migration in the migration history table
  DATA="INSERT INTO ${MIGRATION_TABLE} (collection, version, createdAt, direction) VALUES ('${collection}', ${VERSION}, '${TIMESTAMP}', 'up');"
  
  echo "Executing INSERT: ${DATA}"

  RESPONSE=$(curl -k -L -s --compressed POST \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    --data "${DATA}" \
    ${DB_SQL_URL})

  echo "Response from INSERT: ${RESPONSE}"

  echo "Migration to version ${VERSION} applied for collection ${collection} in the 'up' direction."
}

# Function to rollback a migration down for a specific collection
migrate_down() {
  local collection="$1"
  local VERSION=$2
  local TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")  # ISO 8601 UTC format
  local DOWN_FILE="./migrations/scripts/${collection}/${VERSION}.down.query"

  # Debugging output
  echo "Checking for DOWN migration file: ${DOWN_FILE}"

  if [ ! -f "${DOWN_FILE}" ]; then
    echo "Migration file ${DOWN_FILE} does not exist."
    exit 1
  fi

  DATA=$(<"${DOWN_FILE}")

  echo "Executing DOWN migration for collection '${collection}' version '${VERSION}': ${DATA}"

  RESPONSE=$(curl -k -L -s --compressed POST \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    --data "${DATA}" \
    ${DB_SQL_URL})

  echo "Response from DOWN migration: ${RESPONSE}"

  # Record the rollback in the migration history table
  DATA="INSERT INTO ${MIGRATION_TABLE} (collection, version, createdAt, direction) VALUES ('${collection}', ${VERSION}, '${TIMESTAMP}', 'down');"
  echo "Executing INSERT for rollback: ${DATA}"
  
  RESPONSE=$(curl -k -L -s --compressed POST \
    --header "Accept: application/json" \
    --header "NS: ${DB_NS}" \
    --header "DB: ${DB_DB}" \
    --user "root:root" \
    --data "${DATA}" \
    ${DB_SQL_URL})
  
  echo "Response from INSERT: ${RESPONSE}"

  echo "Rolled back to version ${VERSION} for collection ${collection} in the 'down' direction."
}

# Function to apply or rollback migrations for all collections
process_all_collections() {
  local action=$1

  # Loop through all subdirectories in the migrations directory
  for dir in ./migrations/scripts/*/; do
    collection=$(basename "$dir")
    if [[ "$action" == "up" ]]; then
      read CURRENT_VERSION CURRENT_DIRECTION <<< $(get_latest_version_and_direction "${collection}")
      TARGET_VERSION=$((CURRENT_VERSION + 1))
      migrate_up "${collection}" ${TARGET_VERSION}
    elif [[ "$action" == "down" ]]; then
      read CURRENT_VERSION CURRENT_DIRECTION <<< $(get_latest_version_and_direction "${collection}")
      echo "Current version and direction: $CURRENT_VERSION, $CURRENT_DIRECTION"
      if [[ "$CURRENT_VERSION" -eq 1 && "$CURRENT_DIRECTION" == "down" ]]; then
        echo "Already at the initial version (1, down), cannot rollback further for collection ${collection}."
      elif [ "$CURRENT_VERSION" -ge 1 ]; then
        migrate_down "${collection}" "${CURRENT_VERSION}"
      else
        echo "No further rollback possible for collection ${collection}."
      fi
    fi
  done

  echo "Processed all collections for action: ${action}."
}

# Main function to handle migration direction
main() {
  ACTION=$1
  COLLECTION=$2

  # Initialize migration table if not present
  initialize_migration_table

  if [[ "$ACTION" == "up" && -n "$COLLECTION" ]]; then
    if [[ "$COLLECTION" == "all" ]]; then
      process_all_collections "up"
    else
      read CURRENT_VERSION CURRENT_DIRECTION <<< $(get_latest_version_and_direction "${COLLECTION}")
      TARGET_VERSION=$((CURRENT_VERSION + 1))
      migrate_up "${COLLECTION}" ${TARGET_VERSION}
    fi
  elif [[ "$ACTION" == "down" ]]; then
    if [[ "$COLLECTION" == "all" ]]; then
      process_all_collections "down"
    elif [[ -n "$COLLECTION" ]]; then
      read CURRENT_VERSION CURRENT_DIRECTION <<< $(get_latest_version_and_direction "${COLLECTION}")
      echo "Current version and direction: $CURRENT_VERSION, $CURRENT_DIRECTION"
      if [[ "$CURRENT_VERSION" -eq 1 && "$CURRENT_DIRECTION" == "down" ]]; then
        echo "Already at the initial version (1, down), cannot rollback further for collection ${COLLECTION}."
      elif [[ "$CURRENT_VERSION" -ge 1 ]]; then
        migrate_down "${COLLECTION}" "${CURRENT_VERSION}"
      else
        echo "No further rollback possible for collection ${COLLECTION}."
      fi
    else
      echo "Specify a collection name or 'all' to rollback."
    fi
  else
    echo "Usage: $0 {up|down} {collection_name|all}"
  fi
}

main "$1" "$2"
