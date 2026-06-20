#!/usr/bin/env bash
# =============================================================================
# CareerX AI — Build & Push Docker Images to DockerHub
# =============================================================================
# Run this from the REPO ROOT whenever you update your code:
#   bash k8s/build-and-push.sh
#
# Prerequisites:
#   - Docker Desktop running
#   - Logged into DockerHub: docker login
# =============================================================================

set -e

DOCKERHUB_USER="laeeqahmd"
BACKEND_IMAGE="${DOCKERHUB_USER}/careerx-backend:latest"
FRONTEND_IMAGE="${DOCKERHUB_USER}/careerx-frontend:latest"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       CareerX AI — DockerHub Image Build & Push         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Confirm Docker login ─────────────────────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}✗ Docker is not running. Please start Docker Desktop first.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# ─── Build backend ────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[1/4] Building backend image: ${BACKEND_IMAGE}...${NC}"
docker build -t "${BACKEND_IMAGE}" ./server
echo -e "${GREEN}✓ Backend image built${NC}"

# ─── Build frontend ───────────────────────────────────────────────────────────
echo -e "\n${CYAN}[2/4] Building frontend image: ${FRONTEND_IMAGE}...${NC}"
echo -e "${YELLOW}  ℹ  The frontend image is built with VITE_SERVER_URL=http://careerx.local"
echo -e "     This is the Minikube Ingress host — nginx in the container proxies /api calls.${NC}"

# The nginx.conf inside the image proxies /api to backend-service:8000 directly,
# so no external server URL is needed at runtime. VITE_SERVER_URL just needs to
# match the origin to avoid CORS — the Ingress host covers this.
docker build \
  --build-arg VITE_SERVER_URL="http://careerx.local" \
  --build-arg VITE_FIREBASE_APIKEY="${VITE_FIREBASE_APIKEY}" \
  --build-arg VITE_RAZORPAY_KEY_ID="${VITE_RAZORPAY_KEY_ID}" \
  -t "${FRONTEND_IMAGE}" \
  ./client

echo -e "${GREEN}✓ Frontend image built${NC}"

# ─── Push images ─────────────────────────────────────────────────────────────
echo -e "\n${CYAN}[3/4] Pushing backend to DockerHub...${NC}"
docker push "${BACKEND_IMAGE}"
echo -e "${GREEN}✓ Backend pushed${NC}"

echo -e "\n${CYAN}[4/4] Pushing frontend to DockerHub...${NC}"
docker push "${FRONTEND_IMAGE}"
echo -e "${GREEN}✓ Frontend pushed${NC}"

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            ✅  Images Live on DockerHub!                 ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Backend  : hub.docker.com/r/${DOCKERHUB_USER}/careerx-backend  ║"
echo "║  Frontend : hub.docker.com/r/${DOCKERHUB_USER}/careerx-frontend ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
