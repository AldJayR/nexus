# Nexus Deployment Guide (AWS EC2 + RDS)

This guide outlines how to deploy the Nexus backend to **AWS** using **EC2** (for the app) and **RDS** (for the database) to leverage the AWS Free Tier (12 months).

## Prerequisites

1.  **AWS Account:** Sign up at [aws.amazon.com](https://aws.amazon.com).
2.  **SSH Client:** Terminal (Mac/Linux) or PowerShell/PuTTY (Windows).
3.  **Git:** Installed on your local machine.

---

## Part 1: Set up the Database (AWS RDS)

1.  **Go to RDS:** In the AWS Console, search for "RDS".
2.  **Create Database:** Click **Create database**.
3.  **Choose Creation Method:** Standard create.
4.  **Engine Options:** PostgreSQL.
5.  **Templates:** Select **Free Tier**.
6.  **Settings:**
    *   **DB Instance Identifier:** `nexus-db`
    *   **Master Username:** `postgres`
    *   **Master Password:** Create a strong password (save this!).
7.  **Instance Configuration:** `db.t3.micro` (or `db.t2.micro`).
8.  **Connectivity:**
    *   **Public Access:** **Yes** (Simplest for initial setup/connecting from your PC).
    *   **VPC Security Group:** Create new (e.g., `nexus-db-sg`).
9.  **Create:** Click **Create database**. Wait 5-10 mins.
10. **Get Endpoint:** Once "Available", click the DB name. Copy the **Endpoint** (e.g., `nexus-db.cxyz.us-east-1.rds.amazonaws.com`).

**Your DATABASE_URL:**
`postgres://postgres:<PASSWORD>@<ENDPOINT>:5432/postgres`

---

## Part 2: Launch the Server (AWS EC2)

1.  **Go to EC2:** In AWS Console, search for "EC2".
2.  **Launch Instance:** Click **Launch Instances**.
3.  **Name:** `nexus-api`.
4.  **AMI (OS):** **Ubuntu Server 24.04 LTS** (Free Tier eligible).
5.  **Instance Type:** `t2.micro` or `t3.micro` (Free Tier eligible).
6.  **Key Pair:**
    *   Click **Create new key pair**.
    *   Name: `nexus-key`.
    *   Type: `RSA`.
    *   Format: `.pem` (OpenSSH).
    *   **Download the file** and keep it safe!
7.  **Network Settings:**
    *   **Allow SSH traffic from:** My IP (for security) or Anywhere (0.0.0.0/0).
    *   **Allow HTTP traffic from the internet.**
    *   **Allow HTTPS traffic from the internet.**
8.  **Launch:** Click **Launch instance**.

---

## Part 3: Configure Security Groups (Connect App to DB)

1.  Go to **EC2 Dashboard** -> **Instances** -> Select `nexus-api`.
2.  Copy the **Public IPv4 address**.
3.  Go to **RDS Dashboard** -> Databases -> `nexus-db`.
4.  Click the **VPC security groups** link (active).
5.  Click the **Inbound rules** tab -> **Edit inbound rules**.
6.  **Add Rule:**
    *   Type: `PostgreSQL`.
    *   Source: **Anywhere-IPv4** (0.0.0.0/0) OR typically you put the EC2 Security Group ID here for internal security, but for now allow public access if debugging from local PC is needed.
    *   *Ideally:* Add the EC2 instance's Private IP or Security Group ID.

---

## Part 4: Server Setup (SSH into EC2)

1.  Open your terminal/PowerShell.
2.  Navigate to where you saved `nexus-key.pem`.
3.  Set permissions (Linux/Mac only): `chmod 400 nexus-key.pem`.
4.  **Connect:**
    ```bash
    ssh -i "nexus-key.pem" ubuntu@<EC2-PUBLIC-IP>
    ```
5.  **Update System:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
6.  **Install Node.js (via NVM):**
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    source ~/.bashrc
    nvm install 22
    node -v # Should show v22.x.x
    ```
7.  **Install PNPM & PM2:**
    ```bash
    npm install -g pnpm pm2
    ```

---

## Part 5: Deploy Code

1.  **Clone Repository:**
    ```bash
    git clone <YOUR_GITHUB_REPO_URL> nexus
    cd nexus/server
    ```
2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Setup Environment Variables:**
    ```bash
    nano .env
    ```
    *Paste your production variables:*
    ```env
    NODE_ENV=production
    PORT=3000
    DATABASE_URL=postgres://postgres:<PASSWORD>@<RDS-ENDPOINT>:5432/postgres
    JWT_SECRET=...
    FRONTEND_URL=...
    # ... (Cloudinary & SMTP config)
    ```
    *Press `Ctrl+X`, `Y`, `Enter` to save.*

4.  **Build & Migrate:**
    ```bash
    pnpm build
    pnpm db:migrate:deploy
    pnpm db:seed
    ```

5.  **Start with PM2 (Keep alive):**
    ```bash
    pm2 start dist/index.js --name nexus-api
    pm2 save
    pm2 startup
    # (Run the command output by the previous step to enable auto-start on reboot)
    ```

---

## Part 6: Open Firewall (Security Groups)

By default, the server runs on port 3000, but EC2 blocks this.

1.  Go to AWS Console -> **EC2** -> `nexus-api` -> **Security** tab -> Click the **Security Group**.
2.  **Edit inbound rules** -> **Add rule**.
    *   **Type:** Custom TCP.
    *   **Port range:** `3000`.
    *   **Source:** Anywhere-IPv4 (`0.0.0.0/0`).
3.  **Save rules**.

## Part 7: Verify

Visit `http://<EC2-PUBLIC-IP>:3000/api/v1/health` in your browser.

**You are live!** 🚀

---

## Advanced (Optional): Nginx Reverse Proxy (Remove Port 3000)

To access via standard HTTP (port 80) instead of `:3000`:

1.  **Install Nginx:** `sudo apt install nginx -y`.
2.  **Edit Config:** `sudo nano /etc/nginx/sites-available/default`.
3.  Replace `location /` block with:
    ```nginx
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    ```
4.  **Restart Nginx:** `sudo systemctl restart nginx`.
5.  Now access via `http://<EC2-PUBLIC-IP>`.
