#!/usr/bin/env zsh
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# CREATE DATABASE
echo "\n${BLUE}[${NC} ${GREEN}INICIANDO CONTAINERS${NC} ${BLUE}]${NC}"
docker-compose -f  database-setup.yml up -d
echo "${BLUE}[${NC} ${GREEN}DONE${GREEN} ${BLUE}]${NC}\n"

# DUMPING DATABASE
echo "\n${BLUE}[${NC} ${GREEN}INICIANDO DUMPING${NC} ${BLUE}]${NC}"
docker cp dump.json mongoDB:/dump.json
docker exec mongoDB mongoimport -h localhost:27017 -d CADE_ONIBUS -c users --file dump.json --jsonArray
echo "${BLUE}[${NC} ${GREEN}DONE${GREEN} ${BLUE}]${NC}\n"
