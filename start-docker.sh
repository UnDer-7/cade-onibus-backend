#!/usr/bin/env zsh
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
echo "\n${BLUE}[${NC} ${GREEN}INICIANDO CONTAINERS${NC} ${BLUE}]${NC}"
docker-compose -f  database-setup.yml up -d
echo "${BLUE}[${NC} ${GREEN}DONE${GREEN} ${BLUE}]${NC}\n"
