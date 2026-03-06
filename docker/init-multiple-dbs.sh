#!/bin/bash
# Create all Mindforge databases in PostgreSQL
# Runs on first container startup (when data dir is empty)

set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE mindforge;
  CREATE DATABASE mindforge_teacher;
  CREATE DATABASE mindforge_parent;
EOSQL
