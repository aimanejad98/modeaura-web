# Mode Aura: The "modeaura.ca" Deployment Plan

This is the **"Best Options"** plan for launching your high-end e-commerce store.
It prioritizes **Persistence** (your data/images stay safe), **Performance** (fast local DB), and **Cost-Efficiency**.

## 🏗️ The Architecture (Why this is the best)
We will use a **Virtual Private Server (VPS)**. This is a dedicated slice of a high-performance computer in the cloud.
*   **Server**: DigitalOcean Droplet (Basic, Regular Intel, $6/mo).
*   **OS**: Ubuntu 24.04 (LTS).
*   **Database**: SQLite (Runs locally on the server, super fast, zero cost).
*   **Images**: Stored locally on the server's SSD (Persistent, zero cost).
*   **Domain**: Connected via Cloudflare (Free SSL, DDoS protection).

### 💰 Total Cost Estimate
| Item | Initial Cost | Monthly Cost | Provider |
| :--- | :--- | :--- | :--- |
| **Domain Name** | ~$10.00 / year | - | Namecheap |
| **VPS Server** | - | $6.00 / month | DigitalOcean |
| **SSL Security** | **Free** | **Free** | Cloudflare / Let's Encrypt |
| **Business Email** | - | ~$1.25 / month | Namecheap (Optional) |
| **TOTAL** | **~$10.00** (One-time) | **~$7.25 / month** | |

---

## � Step 0: Upload Your Code to GitHub (Required)
Your code must be on GitHub so the server can download it.

1.  **Create Repository**:
    *   Go to [github.com/new](https://github.com/new).
    *   Name it: `modeaura-web`.
    *   Set to **Public** (Easiest) or **Private** (More secure, but requires SSH keys setup later). *Public is recommended for your first specific deployment.*
    *   Click **Create Repository**.

2.  **Push Your Code**:
    *   Open your terminal in VS Code (Ctrl+`).
    *   Run these commands (replace `YOUR_USERNAME` with your actual GitHub username):
    ```bash
    # Link your local folder to GitHub
    git remote add origin https://github.com/YOUR_USERNAME/modeaura-web.git
    
    # (If it says "remote origin already exists", use this instead):
    # git remote set-url origin https://github.com/YOUR_USERNAME/modeaura-web.git

    # Save all changes
    git add .
    git commit -m "Ready for deployment"

    # Push to GitHub
    git branch -M main
    git push -u origin main
    ```
    *   Refresh your GitHub page. If you see your files there, you are ready for Step 1!

---

## �🚀 Step 1: Secure Your Foundation
1.  **Buy Domain**: Go to [godaddy.com](https://www.godaddy.com/) and buy your domain (e.g., `modeaura.ca`).
2.  **Set up Cloudflare (Free)**:
    *   Sign up at [cloudflare.com](https://www.cloudflare.com/).
    *   Click "Add Site" -> Enter your domain.
    *   Select the **Free Plan**.
    *   Cloudflare will give you two "Nameservers" (e.g., `bob.ns.cloudflare.com`, `alice.ns.cloudflare.com`).
    *   Go to **GoDaddy** -> **Domain Portfolio**.
    *   Click on your domain -> **DNS** -> **Nameservers**.
    *   Click **Change Nameservers** -> **I'll use my own nameservers**.
    *   Paste the two Cloudflare nameservers and save.
    *   *Wait 15-30 mins for it to activate.*

---

## 📧 Step 1.5: Set Up Professional Email (Optional but Recommended)
Do this now, while you are setting up DNS.

1.  **Choose a Provider**:
    *   **Namecheap Email** (~$1.25/mo): Simplest option since you are buying the domain there.
    *   **Zoho Mail** (Free Forever): Good free alternative, but web-only on the free plan.
    *   **Google Workspace** ($6/mo): The gold standard (Gmail interface).

2.  **Connect to Cloudflare**:
    *   Buy the email service (e.g., Namecheap Private Email).
    *   They will give you **MX Records**.
    *   Go to **Cloudflare Dashboard** -> DNS.
    *   Add **MX Records**:
        *   **Type**: `MX`
        *   **Name**: `@`
        *   **Mail Server**: (Paste the value from your provider)
        *   **Priority**: (Paste the number, e.g., 10)
        *   **Save**.
    *   Your email (e.g., `info@modeaura.ca`) will work within 30 minutes!

---

## ☁️ Step 2: Create the Server (Droplet)
1.  Sign up at [digitalocean.com](https://www.digitalocean.com/).
2.  Click **Create** -> **Droplets**.
3.  **Choose Region**: Pick the one closest to your customers (e.g., New York, London, Toronto).
4.  **Choose Image**: **Ubuntu 24.04 (LTS) x64**.
5.  **Choose Size**:
    *   **Basic** (Shared CPU).
    *   **Regular** Option.
    *   **$6/month** (1GB RAM, 1 CPU, 25GB SSD). *This is enough for starting.*
6.  **Authentication**: Choose **Password** (Create a very strong, long password).
7.  **Hostname**: Name it `modeaura-server`.
8.  Click **Create Droplet**.
9.  Copy the **IP Address** (e.g., `142.93.x.x`) once it's ready.

---

## 🔗 Step 3: Connect Domain to Server
1.  Go to your **Cloudflare Dashboard** -> DNS.
2.  Add a Record:
    *   **Type**: `A`
    *   **Name**: `@` (Root)
    *   **IPv4 Address**: Paste your Droplet IP (`142.93.x.x`).
    *   **Proxy Status**: Proxied (Orange Cloud).
    *   **Save**.
3.  Add another Record:
    *   **Type**: `CNAME`
    *   **Name**: `www`
    *   **Target**: `modeaura.ca`
    *   **Proxy Status**: Proxied.
    *   **Save**.
4.  Go to **SSL/TLS** -> set to **Full (Strict)**.

---

## 💻 Step 4: Configure the Server (The "Matrix" Part)
**What do I do here?**
You need to open a tool called "PowerShell" on your computer to talk to the server (VPS) in the cloud.

1.  On your Windows computer, click the **Start Menu**.
2.  Type `PowerShell`.
3.  Click on **Windows PowerShell**. A blue window will open.
    *   **Note:** You do NOT need to be in your project folder. You can run this command from anywhere.
4.  In that blue window, type this command (replace `123.45.67.89` with the **IP Address** DigitalOcean gave you):
    ```bash
    ssh root@123.45.67.89
    ```
5.  Press **Enter**.
6.  It might ask "Are you sure you want to continue connecting?" -> Type `yes` and press **Enter**.
7.  It will ask for a **Password**.
    *   Type the "root password" you created in Step 2.
    *   **Note**: You won't see any dots or stars while typing. Just type it blindly and press **Enter**.
8.  If successful, the text will change to `root@modeaura-server:~#`. You are now inside the server!

Now, copy and paste these commands one by one into that blue window:

**1. Update System & Install Basics:**
```bash
apt update && apt upgrade -y
apt install -y curl git unzip nginx certbot python3-certbot-nginx
```

**2. Install Node.js 20 (LTS):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

**3. Clone Your Code (Download it from GitHub):**
*   **Crucial Concept:** You don't "upload" files from your computer directly.
    1.  You push your code to **GitHub** first.
    2.  The server **downloads** it from GitHub.
*   **Command:** (Replace `YOUR_USERNAME` with your actual GitHub username)
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/modeaura-web.git
cd modeaura-web
```

**4. Install Dependencies & Build:**
```bash
npm install
# Create production environment file
nano .env.local
# Paste your environment variables here:
# DATABASE_URL="file:./dev.db"
# NEXT_PUBLIC_BASE_URL="https://modeaura.ca"
# STORE_PASSWORD="..."
# (Press Ctrl+X, then Y, then Enter to save)

# Build the app
npm run build
```
*(If build fails due to memory on small server, run `npm run build` locally, commit `.next` folder, and pull it. Or enable swap memory - see Pro Tip below).*

**Pro Tip: Enable Swap (Prevents crashes):**
```bash
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

**5. Start the App with PM2 (Keeps it running forever):**
```bash
pm2 start npm --name "modeaura" -- start
pm2 save
pm2 startup
# (Run the command it gives you to freeze the process list)
```

---

## 🌐 Step 5: Go Live with Nginx & SSL
We need Nginx to talk to the outside world and handle SSL.

**1. Configure Nginx:**
```bash
nano /etc/nginx/sites-available/modeaura
```
**Paste this content:**
```nginx
server {
    server_name modeaura.ca www.modeaura.ca;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
**Save & Enable:**
```bash
ln -s /etc/nginx/sites-available/modeaura /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**2. Get Free SSL (HTTPS):**
*Note: Since you use Cloudflare, you already have SSL at the edge. But strictly, you should have it on server too.*
If using Cloudflare "Full" SSL, generate a specialized "Origin Certificate" in Cloudflare and paste it on server.
**Easier Path (Certbot + Cloudflare set to "Full" not "Strict"):**
```bash
certbot --nginx -d modeaura.ca -d www.modeaura.ca
```

---

## ✅ Step 6: Verify
Visit `https://modeaura.ca`.
Your site is live!
*   **Product Changes**: Saved to your VPS disk.
*   **Images**: Uploaded to `public/uploads` on your VPS. Safe.
*   **Speed**: Blazing fast.

---

## 🔄 How to Update
When you make changes to your code locally:

1.  **Save to GitHub**:
    Open PowerShell, `cd` to your folder, and run:
    ```bash
    git add .
    git commit -m "Added new winter products" 
    # (Change the text in quotes to whatever you actually did!)
    git push
    ```

2.  **Update Your Server**:
    (Once you have your VPS set up in Step 2+)
    *   SSH into server: `ssh root@...`
    *   `cd /var/www/modeaura-web`
    *   `git pull`
    *   `npm install` (if new packages)
    *   `npm run build`
    *   `pm2 reload modeaura`

---

## 🔑 Step 7: Accessing Your Dashboard (Atelier Portal)
Once deployed, your website is open to the world.
To manage products, orders, and settings:

1.  **Go to:** `https://modeaura.ca/atelier-portal-v7`
2.  **Email Identifier:** `modeaura1@gmail.com`
3.  **Secure Key:** `admin123`
    *   *(Note: This is the default created by the system. You should change this password later in the Staff settings for security).*
4.  **Dashboard:** You will be redirected to `https://modeaura.ca/dashboard`.

Enjoy your new digital empire! 🏰

