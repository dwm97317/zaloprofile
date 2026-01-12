# 🚀 Deployment Guide - LINE Mini App

This guide provides step-by-step instructions for deploying the Vhuong Tra Parcel Integration LINE Mini App to production.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [LINE LIFF Setup](#line-liff-setup)
- [Google Maps Setup](#google-maps-setup)
- [Backend Configuration](#backend-configuration)
- [Build and Deploy](#build-and-deploy)
- [Post-Deployment Testing](#post-deployment-testing)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ **LINE Developers Account** with verified business account
- ✅ **Google Cloud Platform Account** with billing enabled
- ✅ **Web Server** with HTTPS support (required for LIFF)
- ✅ **Backend API** deployed and accessible
- ✅ **Domain Name** (recommended for production)
- ✅ **Node.js** >= 16.x installed locally
- ✅ **Git** access to the repository

---

## Pre-Deployment Checklist

### 1. Code Review

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] All API endpoints working
- [ ] Translations complete for all languages
- [ ] Responsive design verified on multiple devices
- [ ] Performance optimized (bundle size, lazy loading)

### 2. Configuration Review

- [ ] `src/config/config.js` - API base URL set to production
- [ ] `src/i18n.js` - Default language set correctly
- [ ] Environment variables configured
- [ ] API keys secured (not in source code)

### 3. Security Review

- [ ] HTTPS enabled on hosting
- [ ] CORS configured correctly
- [ ] API authentication working
- [ ] Sensitive data not exposed in client
- [ ] XSS and CSRF protections in place

---

## LINE LIFF Setup

### Step 1: Create LINE Provider

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Click **"Create a new provider"**
3. Enter provider name (e.g., "Vhuong Tra Logistics")
4. Click **"Create"**

### Step 2: Create LINE Login Channel

1. In your provider, click **"Create a new channel"**
2. Select **"LINE Login"**
3. Fill in the required information:
   - **Channel name**: Vhuong Tra Parcel Integration
   - **Channel description**: International logistics and parcel consolidation
   - **App types**: Check "Web app"
   - **Email address**: Your support email
4. Click **"Create"**

### Step 3: Create LIFF App

1. In your LINE Login channel, go to **"LIFF"** tab
2. Click **"Add"**
3. Configure LIFF app:
   ```
   LIFF app name: Vhuong Tra Parcel
   Size: Full
   Endpoint URL: https://your-domain.com
   Scope: 
     ✓ profile
     ✓ openid
     ✓ email (optional)
   Bot link feature: Off (unless you have a bot)
   Scan QR: Off
   ```
4. Click **"Add"**
5. **Copy the LIFF ID** (format: `1234567890-abcdefgh`)

### Step 4: Configure Channel Settings

1. Go to **"Basic settings"** tab
2. Note your **Channel ID** and **Channel Secret**
3. Go to **"LINE Login"** tab
4. Add **Callback URL**: `https://your-domain.com/callback` (if needed)
5. Add **Logout URL**: `https://your-domain.com/logout` (if needed)

### Step 5: Verify LIFF Settings

1. Go back to **"LIFF"** tab
2. Click on your LIFF app
3. Verify all settings are correct
4. Test the LIFF URL in LINE app

---

## Google Maps Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: "Vhuong Tra Parcel"
4. Click **"Create"**

### Step 2: Enable Required APIs

1. Go to **"APIs & Services"** → **"Library"**
2. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
   - **Geolocation API** (optional)

### Step 3: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key
4. Click **"Restrict Key"**

### Step 4: Restrict API Key

1. **Application restrictions**:
   - Select **"HTTP referrers (web sites)"**
   - Add your domain: `https://your-domain.com/*`
   - Add localhost for testing: `http://localhost:*`

2. **API restrictions**:
   - Select **"Restrict key"**
   - Check:
     - Maps JavaScript API
     - Geocoding API
     - Places API

3. Click **"Save"**

### Step 5: Set Up Billing

1. Go to **"Billing"**
2. Link a billing account (required for Maps API)
3. Set up budget alerts (recommended)

---

## Backend Configuration

### Step 1: Update Database

Update the backend database with LIFF configuration:

```sql
-- Update LIFF ID in configuration table
UPDATE config SET 
  liff_id = '1234567890-abcdefgh',
  google_maps_key = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
WHERE wxapp_id = '10001';
```

### Step 2: Verify Backend Endpoints

Test these critical endpoints:

```bash
# Get LIFF configuration
curl https://your-api.com/index.php?s=api/LineApp/base&wxapp_id=10001

# Expected response:
{
  "code": 1,
  "data": {
    "liff_id": "1234567890-abcdefgh",
    "google_maps_key": "AIzaSy...",
    "scopes": ["profile", "openid"],
    "pay_is_enable": true
  }
}
```

### Step 3: Configure CORS

Update your backend CORS settings:

```php
// In your backend index.php or middleware
header('Access-Control-Allow-Origin: https://your-domain.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, platform');
header('Access-Control-Allow-Credentials: true');
```

### Step 4: Update Platform Header Check

Ensure backend accepts `platform: LINE`:

```php
// In your request handler
$platform = $_SERVER['HTTP_PLATFORM'] ?? '';
if ($platform !== 'LINE') {
    // Handle accordingly
}
```

---

## Build and Deploy

### Step 1: Update Configuration

Update `src/config/config.js`:

```javascript
import { appEnv } from "./env";

const devBaseURL = "http://localhost:8080/index.php?s=api/";
const proBaseURL = "https://your-api.com/index.php?s=api/";

export const BASE_URL = appEnv === "development" ? devBaseURL : proBaseURL;
export const TIMEOUT = 5000;
```

### Step 2: Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output will be in dist/ directory
```

### Step 3: Verify Build

```bash
# Test the build locally
npx serve dist

# Open http://localhost:3000 in browser
# Check for any errors in console
```

### Step 4: Deploy to Web Server

#### Option A: Manual Upload (FTP/SFTP)

```bash
# Upload dist/ contents to your web server
# Example using scp:
scp -r dist/* user@your-server.com:/var/www/html/
```

#### Option B: Using Git Deployment

```bash
# On your server
cd /var/www/html
git pull origin main
npm install
npm run build
```

#### Option C: Using CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/html/
          SOURCE: dist/
```

### Step 5: Configure Web Server

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>

    # SPA routing
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
</VirtualHost>
```

---

## Post-Deployment Testing

### Step 1: Verify LIFF Initialization

1. Open LINE app on your phone
2. Access the LIFF URL: `https://liff.line.me/1234567890-abcdefgh`
3. Check that the app loads without errors
4. Verify LINE login works

### Step 2: Test Core Features

- [ ] **Authentication**: LINE login and logout
- [ ] **Package Report**: Submit a test package
- [ ] **Address Management**: Add/edit/delete address
- [ ] **Google Maps**: Address autocomplete works
- [ ] **Order Tracking**: View order status
- [ ] **Freight Calculator**: Calculate shipping cost
- [ ] **Language Switch**: Change language (if implemented)
- [ ] **Payment**: Test payment flow (in sandbox)

### Step 3: Performance Testing

```bash
# Test page load speed
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Check bundle size
ls -lh dist/assets/*.js
```

### Step 4: Mobile Testing

Test on multiple devices:
- [ ] iPhone (iOS 14+)
- [ ] Android (Android 8+)
- [ ] Different screen sizes
- [ ] Different LINE app versions

### Step 5: Monitor Logs

```bash
# Check server logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check application logs (if implemented)
tail -f /var/www/html/logs/app.log
```

---

## Troubleshooting

### Issue: LIFF SDK Initialization Failed

**Symptoms**: Error "LIFF SDK initialization failed"

**Solutions**:
1. Verify LIFF ID is correct in backend
2. Check that endpoint URL matches deployed URL
3. Ensure HTTPS is enabled
4. Clear browser cache and try again

### Issue: Google Maps Not Loading

**Symptoms**: Map shows gray box or error

**Solutions**:
1. Verify API key is correct
2. Check that Maps JavaScript API is enabled
3. Verify billing is set up on Google Cloud
4. Check browser console for specific error
5. Verify domain restrictions on API key

### Issue: API Requests Failing

**Symptoms**: Network errors or 401/403 responses

**Solutions**:
1. Check CORS configuration on backend
2. Verify `platform: LINE` header is being sent
3. Check token is being stored and sent correctly
4. Verify backend API is accessible from client
5. Check firewall rules

### Issue: White Screen After Deployment

**Symptoms**: Blank page, no errors

**Solutions**:
1. Check browser console for errors
2. Verify all assets are uploaded correctly
3. Check web server configuration (SPA routing)
4. Verify base URL in `vite.config.js`
5. Clear CDN cache if using one

### Issue: Translations Not Working

**Symptoms**: Keys showing instead of translated text

**Solutions**:
1. Verify translation files are in `dist/locales/`
2. Check i18n initialization in `src/i18n.js`
3. Verify language code is correct (th, zh, vi)
4. Check browser console for loading errors

---

## Rollback Procedure

If deployment fails, follow these steps to rollback:

### Step 1: Identify Issue

```bash
# Check error logs
tail -100 /var/log/nginx/error.log

# Check application logs
tail -100 /var/www/html/logs/app.log
```

### Step 2: Rollback Code

```bash
# If using Git
cd /var/www/html
git log --oneline -10  # Find previous working commit
git checkout <commit-hash>
npm install
npm run build
```

### Step 3: Restore Database (if needed)

```sql
-- Restore previous LIFF configuration
UPDATE config SET 
  liff_id = '<previous-liff-id>',
  google_maps_key = '<previous-key>'
WHERE wxapp_id = '10001';
```

### Step 4: Clear Cache

```bash
# Clear Nginx cache
sudo nginx -s reload

# Clear application cache
rm -rf /var/www/html/cache/*
```

### Step 5: Verify Rollback

1. Test LIFF app in LINE
2. Verify core features work
3. Check error logs are clear
4. Monitor for 10-15 minutes

---

## Monitoring and Maintenance

### Set Up Monitoring

1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **Error Tracking**: Implement Sentry or similar
3. **Analytics**: Set up Google Analytics or similar
4. **Performance**: Use Lighthouse CI for continuous monitoring

### Regular Maintenance

- [ ] **Weekly**: Check error logs
- [ ] **Monthly**: Review performance metrics
- [ ] **Quarterly**: Update dependencies
- [ ] **Yearly**: Renew SSL certificates

### Backup Strategy

```bash
# Backup script (run daily)
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /backups/app-$DATE.tar.gz /var/www/html/
# Keep last 30 days
find /backups -name "app-*.tar.gz" -mtime +30 -delete
```

---

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] API keys not exposed in client code
- [ ] CORS properly configured
- [ ] Security headers set (X-Frame-Options, CSP, etc.)
- [ ] Regular security updates applied
- [ ] Access logs monitored for suspicious activity
- [ ] Rate limiting implemented on API
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

---

## Support

If you encounter issues during deployment:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
3. Check [Google Maps Documentation](https://developers.google.com/maps/documentation)
4. Contact technical support: support@vhuongtra.com

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 1.0.0 | Initial deployment guide |

---

<div align="center">

**Deployment Guide v1.0.0**

[⬆ Back to Top](#-deployment-guide---line-mini-app)

</div>
