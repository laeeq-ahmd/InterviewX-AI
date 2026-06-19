# Deploying InterviewX AI to AWS EC2 using k3s

This guide walks you through deploying the InterviewX AI application (Frontend, Backend, and ChromaDB) to an AWS EC2 instance using **k3s**, a lightweight, production-ready Kubernetes distribution that includes Traefik as the default ingress controller.

## Prerequisites

1. An **AWS EC2 Instance**:
   - OS: Ubuntu 22.04 LTS (recommended)
   - Size: `t3.medium` or larger (ChromaDB + Node.js + React build requires memory). `t2.micro` will likely crash.
   - Storage: 20GB+ gp3 EBS volume.
2. **Security Group Rules** open for:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
3. A registered **Domain Name** (optional but recommended) pointing to your EC2 instance's public IP.
4. Docker images built and pushed to a registry (e.g., Docker Hub or AWS ECR).

---

## 1. Prepare Docker Images

Before deploying to Kubernetes, build and push your Docker images. From your local machine:

```bash
# 1. Login to your docker registry
docker login

# 2. Build and push Backend
cd server
docker build -t your-dockerhub-user/interviewx-backend:latest .
docker push your-dockerhub-user/interviewx-backend:latest

# 3. Build and push Frontend
cd ../client
docker build -t your-dockerhub-user/interviewx-frontend:latest .
docker push your-dockerhub-user/interviewx-frontend:latest
```

*Note: Update `k8s/backend.yaml` and `k8s/frontend.yaml` to replace `your-dockerhub-user` with your actual registry path.*

---

## 2. Install k3s on EC2

SSH into your AWS EC2 instance:

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

Install k3s. This script automatically downloads, installs, and starts a single-node Kubernetes cluster.

```bash
curl -sfL https://get.k3s.io | sh -
```

Verify the installation:

```bash
sudo k3s kubectl get nodes
sudo k3s kubectl get pods -A
```

---

## 3. Apply Kubernetes Manifests

Copy your `k8s/` folder from your local machine to the EC2 instance using `scp` or Git.

Once the files are on the server, apply them in the following order:

```bash
# 1. Create the namespace
sudo k3s kubectl apply -f k8s/namespace.yaml

# 2. Deploy ChromaDB (includes Persistent Volume Claim)
sudo k3s kubectl apply -f k8s/chromadb.yaml

# 3. Deploy Backend (includes ConfigMap and Secrets)
sudo k3s kubectl apply -f k8s/backend.yaml

# 4. Deploy Frontend
sudo k3s kubectl apply -f k8s/frontend.yaml
```

Wait for the pods to spin up. You can monitor them with:

```bash
sudo k3s kubectl get pods -n interviewx -w
```

---

## 4. Configure Ingress (Traefik)

Edit `k8s/ingress.yaml` to match your domain name or IP address.

```yaml
spec:
  rules:
    - host: yourdomain.com # Or remove the 'host' line entirely to map to the raw IP
```

If you are using a raw IP instead of a domain, your `rules` section should look like this:

```yaml
spec:
  rules:
    - http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

Apply the ingress rule:

```bash
sudo k3s kubectl apply -f k8s/ingress.yaml
```

---

## 5. Test the Application

1. Open your browser.
2. Navigate to your EC2 Public IP or Domain Name: `http://<ec2-public-ip>`
3. The Traefik Ingress controller will route `/api/*` traffic to the Node.js backend, and all other traffic `/` to the Nginx serving the React frontend.

## 6. Updating the App Later

When you push new code:
1. Build and push new Docker images with a new tag (e.g., `:v2`).
2. Update the `image:` tags in `k8s/backend.yaml` and `k8s/frontend.yaml`.
3. Re-apply the files: `sudo k3s kubectl apply -f k8s/backend.yaml`

Or, if keeping the `:latest` tag, force a rolling restart:
```bash
sudo k3s kubectl rollout restart deployment backend -n interviewx
sudo k3s kubectl rollout restart deployment frontend -n interviewx
```
