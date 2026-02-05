# Automated Deployment Guide for Windows VPS

This guide explains how to set up automated deployment from GitHub to your Windows VPS.

---

### Prerequisites

1. **Enable SSH on Windows VPS:**
   ```powershell
   # Run as Administrator
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```

2. **Configure SSH Authentication:**
   - Option A: Password authentication (less secure)
   - Option B: SSH key authentication (recommended)

### Setup Steps

1. **Add GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VPS_HOST`: Your VPS IP address or domain
     - `VPS_USERNAME`: Windows username (e.g., `Administrator`)
     - `VPS_PASSWORD`: Windows password (if using password auth)
     - `VPS_SSH_KEY`: SSH private key (if using key auth)
     - `VPS_SSH_PORT`: SSH port (default: 22)
     - `VPS_DEPLOY_PATH`: Full path to your project on VPS (e.g., `C:\Users\1\OneDrive\Documents\workstation\project\mmserver`)

2. **The workflow file is already created** at `.github/workflows/deploy.yml`

3. **Test the deployment:**
   - Push to your `main` branch
   - Or manually trigger from Actions tab → "Deploy to Windows VPS" → "Run workflow"

### Customizing the Workflow

Edit `.github/workflows/deploy.yml` to:
- Change the branch name (currently `main`)
- Adjust the restart command based on your process manager
- Add pre-deployment steps (backup, tests, etc.)

---

## Process Management Options

Install PM2 globally:
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

Update `deploy.ps1` to use PM2:
```powershell
pm2 restart mmserver || pm2 start index.js --name mmserver
```