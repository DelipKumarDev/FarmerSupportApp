# Final Deployment Walkthrough

**Complete step-by-step guide for deploying the Farmer Support & Marketplace Web App to production**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Choose Your Deployment Platform](#choose-your-deployment-platform)
3. [Option A: Deploy with Heroku + Vercel (Simplest)](#option-a-heroku--vercel-recommended)
4. [Option B: Deploy with AWS (Most Scalable)](#option-b-aws-most-scalable)
5. [Option C: Deploy with DigitalOcean (Cost-Effective)](#option-c-digitalocean-cost-effective)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Alerts Setup](#monitoring--alerts-setup)
8. [Troubleshooting](#troubleshooting)
9. [Success Criteria](#success-criteria)

---

## ✅ Pre-Deployment Checklist

Before starting deployment, verify everything is ready:

### Code Status
```bash
# Check git status
cd /workspaces/FarmerSupportApp
git status

# All changes should be committed
# ✅ Expected: "nothing to commit, working tree clean"
```

### Environment Variables Reviewed
```bash
# Backend - check .env file exists
cat backend/.env

# Frontend - check .env.local exists (if created)
cat frontend/.env.local

# ✅ Both should contain:
# - MONGODB_URI
# - JWT_SECRET (32+ characters)
# - NODE_ENV=production
# - VITE_API_URL (for frontend, pointing to backend)
```

### Dependencies Installed
```bash
# Backend
cd backend
npm list

# ✅ Should show all dependencies without warnings

# Frontend
cd ../frontend
npm list

# ✅ Should show all dependencies without warnings
```

### Build Tests
```bash
# Test backend build
cd backend
npm run build 2>/dev/null || true

# ✅ No errors should appear

# Test frontend build
cd ../frontend
npm run build

# ✅ Should produce `dist/` folder with < 500KB total size
ls -lh dist/
```

### Documentation Review
```bash
# Verify all deployment docs exist
ls -la *.md | grep -i deploy

# ✅ Should show:
# - DEPLOYMENT_CHECKLIST.md
# - FINAL_RUN_INSTRUCTIONS.md
# - DEPLOYMENT_WALKTHROUGH.md (this file)
```

---

## 🎯 Choose Your Deployment Platform

### Comparison Table

| Platform | Cost | Scalability | Setup Time | Best For |
|----------|------|-------------|-----------|----------|
| **Heroku + Vercel** | $20-100/mo | Good | 30 min | Small-medium teams |
| **AWS** | $30-200/mo | Excellent | 2 hours | Enterprise-scale |
| **DigitalOcean** | $15-60/mo | Good | 1 hour | Cost-conscious |
| **Railway** | $5-100/mo | Good | 15 min | Quick deployment |
| **Render** | $10-100/mo | Good | 20 min | Modern platforms |

**Recommendation for this project**: **Option A (Heroku + Vercel)** - Simplest, free tier available

---

## 🚀 Option A: Heroku + Vercel (Recommended)

### ✅ Pros
- Easiest setup (git push deployment)
- Free tier available for testing
- Built-in SSL/HTTPS
- Automatic scaling
- No infrastructure management

### ⏱️ Time: 30-45 minutes

---

## Part 1: Deploy Backend to Heroku

### Step 1.1: Create Heroku Account
```
1. Go to heroku.com
2. Click "Sign up" 
3. Create account with email
4. Verify email
5. Create a new app
   - App name: farmer-app-api
   - Region: United States (or closest to you)
```

### Step 1.2: Install Heroku CLI
```bash
# macOS
brew install heroku

# Ubuntu/Linux
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Windows (or download from heroku.com/download)
npm install -g heroku

# Verify installation
heroku --version
# ✅ Should show: heroku/7.x.x
```

### Step 1.3: Login to Heroku
```bash
# Login to Heroku from terminal
heroku login

# ✅ Will open browser for authentication
# ✅ Check terminal shows "Logged in as your-email@example.com"
```

### Step 1.4: Create Heroku App
```bash
cd /workspaces/FarmerSupportApp/backend

# Create app on Heroku
heroku create farmer-app-api

# ✅ Output should show:
# Creating ⬢ farmer-app-api... done
# https://farmer-app-api.herokuapp.com/ | https://git.heroku.com/farmer-app-api.git
```

### Step 1.5: Add MongoDB URI to Heroku
```bash
# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/farmer_app?retryWrites=true&w=majority"

heroku config:set JWT_SECRET="your-super-secret-key-min-32-chars-1234567890"

heroku config:set NODE_ENV=production

heroku config:set API_URL="https://farmer-app-api.herokuapp.com"

# Verify variables are set
heroku config

# ✅ Should show all 4 variables
```

### Step 1.6: Create Procfile
```bash
# Create Procfile in backend directory
cat > Procfile << 'EOF'
web: npm start
EOF

# Add to git
git add Procfile
git commit -m "Add Procfile for Heroku deployment"
```

### Step 1.7: Update package.json
```bash
# Check start script exists
cat package.json | grep "start"

# Should show: "start": "node src/server.js"
# If not, update it:
# nano package.json
# Update scripts section to include start script
```

### Step 1.8: Deploy Backend
```bash
# Add Heroku remote if not already added
git remote add heroku https://git.heroku.com/farmer-app-api.git

# Deploy to Heroku
git push heroku main

# ✅ Watch logs:
# Compressing source files... done
# Pushing source... 
# Building source...
# npm install...
# Building app...
# Launching app...
# https://farmer-app-api.herokuapp.com deployed to Heroku

# This takes 2-3 minutes
```

### Step 1.9: Verify Backend Deployment
```bash
# Check backend is running
curl https://farmer-app-api.herokuapp.com/api/health

# ✅ Should respond:
# {"status":"ok","timestamp":"2024-02-08T...","uptime":...}

# View logs if something went wrong
heroku logs --tail
```

### Step 1.10: Seed Database (One-time)
```bash
# Run seed command on Heroku
heroku run "npm run seed"

# ✅ Should show:
# ✅ All indexes created successfully
# ✅ Database seeded with sample data

# Wait for 30 seconds...
```

**✅ Backend Deployment Complete!**

Backend URL: `https://farmer-app-api.herokuapp.com`

---

## Part 2: Deploy Frontend to Vercel

### Step 2.1: Create Vercel Account
```
1. Go to vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel
5. Create Vercel account
```

### Step 2.2: Create GitHub Repository
```bash
# Go to github.com
# Create new repository: "FarmerSupportApp"
# Choose: Public or Private
# Do NOT add README (we have one)

# Initialize git and push code
cd /workspaces/FarmerSupportApp

git init
git add .
git commit -m "Initial commit: Farmer Support & Marketplace Web App"

# Add your GitHub repository URL
git remote add origin https://github.com/USERNAME/FarmerSupportApp.git

# Push to GitHub
git branch -M main
git push -u origin main

# ✅ Code is now on GitHub
```

### Step 2.3: Import Project to Vercel
```
1. Go to vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Paste: https://github.com/USERNAME/FarmerSupportApp
5. Click "Continue"
6. Select:
   - Framework: Vite
   - Root Directory: ./frontend
   - Build Command: npm run build
   - Output Directory: dist
7. Click "Deploy"
```

### Step 2.4: Configure Environment Variables
```
1. In Vercel Dashboard → Settings → Environment Variables
2. Add:
   - Name: VITE_API_URL
   - Value: https://farmer-app-api.herokuapp.com
3. Click "Add"
4. Redeploy:
   - Go to Deployments
   - Click three dots on latest
   - Select "Redeploy"
```

### Step 2.5: Verify Frontend Deployment
```bash
# Vercel will show deployment URL in dashboard
# Format: https://farmer-support-app.vercel.app

# Test frontend
curl https://farmer-support-app.vercel.app

# ✅ Should return HTML with "<div id="root">"
```

**✅ Frontend Deployment Complete!**

Frontend URL: `https://farmer-support-app.vercel.app`

---

## Part 3: Configure Custom Domain (Optional)

### Step 3.1: Point Domain to Heroku (Backend)
```
Backend DNS Setup:
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Create new DNS record:
   - Type: CNAME
   - Host: api
   - Value: farmer-app-api.herokuapp.com
3. Wait 5-10 minutes for DNS propagation

Test:
curl https://api.yourdomain.com/api/health
```

### Step 3.2: Point Domain to Vercel (Frontend)
```
Frontend DNS Setup:
1. In Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter: yourdomain.com
4. Add DNS records as shown by Vercel
5. Wait for verification (5-10 minutes)

Test:
curl https://yourdomain.com
```

**✅ Custom Domain Setup Complete!**

---

## 🎯 Option B: AWS (Most Scalable)

### ⏱️ Time: 2 hours

If you need more control and scalability, use AWS.

### Step 1: Create AWS Account
```
1. Go to aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email and password
4. Complete verification
5. Add payment method
6. Choose business plan
```

### Step 2: Launch EC2 Instance for Backend
```bash
# Go to AWS Console → EC2 → Instances → Launch Instance

# Configuration:
- Name: farmer-app-backend
- OS: Ubuntu 22.04 LTS
- Instance Type: t3.micro (1 year free tier)
- Key Pair: Create new → Download farmer-app.pem
- Security Group: Create new
  - Allow SSH (port 22) from your IP
  - Allow HTTP (port 80) from 0.0.0.0
  - Allow HTTPS (port 443) from 0.0.0.0
- Storage: 30 GB (covered by free tier)

# Launch instance
# ✅ Get the public IP address
```

### Step 3: Connect to EC2 Instance
```bash
# From local machine
chmod 400 farmer-app.pem

ssh -i farmer-app.pem ubuntu@<your-instance-ip>

# ✅ You're now connected to the server
```

### Step 4: Install Node.js
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v
npm -v
```

### Step 5: Install MongoDB (or use MongoDB Atlas)
```bash
# RECOMMENDED: Use MongoDB Atlas (free tier)
# It's easier and more reliable

# Create Atlas account at mongodb.com
# Create free cluster
# Get connection string
# Use in environment variables
```

### Step 6: Deploy Backend
```bash
# Copy backend code to server
scp -r -i farmer-app.pem ./backend ubuntu@<ip>:/home/ubuntu/

# SSH into server
ssh -i farmer-app.pem ubuntu@<ip>

# Install dependencies
cd backend
npm install

# Create .env file
nano .env

# Add:
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key

# Install PM2 (process manager)
sudo npm install -g pm2

# Start app with PM2
pm2 start src/server.js --name farmer-app

# Save PM2 config
pm2 save

# Start PM2 on reboot
pm2 startup
```

### Step 7: Install Nginx (Reverse Proxy)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/farmer-app

# Add:
server {
    listen 80;
    server_name <your-ip-or-domain>;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/farmer-app /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Enable HTTPS with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# ✅ Certificate will auto-renew
```

### Step 9: Deploy Frontend with Vercel
```
Same as Option A, Step 2
```

**✅ AWS Deployment Complete!**

---

## 🎯 Option C: DigitalOcean (Cost-Effective)

### ⏱️ Time: 1 hour

**Similar to AWS but simpler**

### Quick Steps:
```
1. Create DigitalOcean account (digitalocean.com)
2. Create Droplet ($5-6/month)
   - OS: Ubuntu 22.04
   - Tier: Basic ($5/month)
3. SSH into droplet
4. Follow Option B steps 4-8 (same process)
5. Deploy frontend to Vercel (same as Option A)
```

---

## ✅ Post-Deployment Verification

### Step 1: Test Backend API

```bash
# Test health check
curl https://api.yourdomain.com/api/health

# ✅ Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-02-08T10:30:45.123Z",
#   "uptime": 1234.56
# }
```

### Step 2: Test Authentication

```bash
# Get an auth token
TOKEN=$(curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmersupport.com",
    "password": "admin123"
  }' | jq -r '.token')

# ✅ Should return a JWT token

# Verify token works
curl https://api.yourdomain.com/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# ✅ Should return user profile
```

### Step 3: Test API Endpoints

```bash
# Get all crops
curl https://api.yourdomain.com/api/crops

# ✅ Should return array of crops

# Get marketplace listings
curl https://api.yourdomain.com/api/listings

# ✅ Should return listings or empty array

# Validate discount code
curl -X POST https://api.yourdomain.com/api/discounts/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "FLAT500", "totalAmount": 3000}'

# ✅ Should return discount information
```

### Step 4: Test Frontend

```bash
# Open in browser
https://farmer-support-app.vercel.app

# ✅ Should see login page
# ✅ CSS and images should load
# ✅ No console errors

# Try logging in
Email: admin@farmersupport.com
Password: admin123

# ✅ Should redirect to dashboard
# ✅ Data should load from API
```

### Step 5: Test Each User Role

```bash
# Test Farmer Role
Email: rajesh@farmer.com
Password: farmer123
✅ Should see farmer dashboard with products option

# Test Customer Role
Email: amit@customer.com
Password: customer123
✅ Should see customer dashboard with marketplace

# Test Admin Role
Email: admin@farmersupport.com
Password: admin123
✅ Should see admin dashboard link
```

### Step 6: Test File Upload

```bash
# Go to Disease Detection page
# Select crop: Wheat
# Upload image from /assets/sample-leaf.jpg
# ✅ Should upload successfully
# ✅ Should show detection results
```

### Step 7: Check Performance

```bash
# Run Lighthouse audit
1. Open https://farmer-support-app.vercel.app
2. Open Chrome DevTools (F12)
3. Go to Lighthouse tab
4. Generate report

# ✅ Target scores:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

### Step 8: Monitor Logs

```bash
# For Heroku backend:
heroku logs --tail

# For AWS backend:
ssh into instance and run:
pm2 logs farmer-app

# For Vercel frontend:
# Vercel Dashboard → Deployments → View Logs

# ✅ Should not see any errors
```

**✅ All Verification Tests Passed!**

---

## 🔔 Monitoring & Alerts Setup

### Step 1: Set Up Sentry (Error Monitoring)

```
1. Go to sentry.io
2. Create free account
3. Create new JavaScript project
4. Create new Node.js project
5. Note the DSN for both
6. Update .env files:

Frontend .env:
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

Backend .env:
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

7. Restart applications
```

### Step 2: Set Up Uptime Monitoring

```
1. Go to uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - Type: HTTP(s)
   - URL: https://api.yourdomain.com/api/health
   - Interval: Every 5 minutes
   - Alert email: your-email@example.com
4. Click "Create Monitor"

✅ You'll get email if site goes down
```

### Step 3: Set Up Slack Alerts

```
1. Create Slack workspace (if needed)
2. Create #alerts channel
3. In Sentry → Settings → Integrations → Slack
4. Connect Slack account
5. Select #alerts channel
6. Save

✅ Errors will be posted to Slack automatically
```

### Step 4: View Metrics

```
For Heroku:
1. Dashboard → Your app → Metrics
2. View CPU, memory, request count

For AWS CloudWatch:
1. AWS Console → CloudWatch
2. View graphs and metrics

For Vercel:
1. Dashboard → Analytics
2. View usage statistics
```

**✅ Monitoring Setup Complete!**

---

## 🔧 Troubleshooting

### Backend Won't Start

```bash
# Check logs
heroku logs --tail
# or
pm2 logs

# Common issues:
1. MongoDB connection failed
   - Check MONGODB_URI environment variable
   - Verify IP whitelist in MongoDB Atlas
   
2. Port already in use
   - Kill process: lsof -ti:5000 | xargs kill -9
   
3. Missing dependencies
   - Run: npm install
   
4. Environment variables not set
   - Verify all vars are set
   - Restart application
```

### Frontend Not Loading API Data

```bash
# Check browser console (F12)

1. CORS error
   - Backend needs CORS enabled for frontend domain
   - Update backend CORS settings
   
2. API URL wrong
   - Check VITE_API_URL in Vercel environment
   - Should be https://api.yourdomain.com
   
3. Token expired
   - Clear localStorage
   - Login again
   
4. Network tab shows 401/403
   - Check authorization header
   - Verify token format: "Bearer TOKEN"
```

### Database Seeding Failed

```bash
# Reseed database
# For Heroku:
heroku run "npm run seed"

# For AWS/DigitalOcean:
ssh into server
cd backend
npm run seed

# Issues:
1. Duplicate key error
   - Database already seeded
   - Clear collections and reseed
   
2. Connection timeout
   - Check MONGODB_URI
   - Verify IP whitelist
```

### Performance Issues

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com/api/crops

# Slow responses (> 500ms)
1. Check database query performance
2. Add caching layer (Redis)
3. Optimize queries with indexes

# High CPU usage
1. Check for infinite loops
2. Review error logs
3. Scale to more instances

# High memory usage
1. Check for memory leaks
2. Restart application
3. Increase instance size
```

### Domain Not Working

```bash
# DNS not propagated yet
1. Wait 5-15 minutes
2. Check DNS resolution:
   nslookup api.yourdomain.com
   
# Wrong DNS records
1. Verify CNAME records point to platform
2. Check TTL value (usually 300-3600 seconds)
3. Flush DNS cache

# SSL certificate issues
1. Ensure HTTPS is configured
2. Check certificate expiration
3. Renew if needed
```

---

## ✨ Success Criteria

### All of These Should Be True ✅

```
✅ Backend API responding to requests
   curl https://api.yourdomain.com/api/health → 200 OK

✅ Frontend loading in browser
   https://yourdomain.com → Displays login page

✅ User can login
   admin@farmersupport.com / admin123 → Redirects to dashboard

✅ API requests from frontend working
   Dashboard loads data from API without errors

✅ Each user role working
   Farmer, Customer, Admin → Different dashboards

✅ File uploads working
   Disease detection → Can upload and process images

✅ Database working
   All CRUD operations succeed without errors

✅ Performance acceptable
   Lighthouse score > 85, API response < 300ms

✅ Monitoring active
   Errors tracked in Sentry
   Uptime monitored by Uptime Robot
   Slack alerts configured

✅ HTTPS enabled
   Both frontend and backend use HTTPS
   No mixed content warnings

✅ Environment variables set
   All secrets in environment, not in code

✅ Logging working
   Backend logs show requests
   No sensitive data in logs

✅ Error handling working
   Invalid requests return proper error messages
   No 500 errors on bad input
```

---

## 🎊 Deployment Complete!

### What You Now Have

```
✅ Production-ready backend API
   - Auto-scaling (Heroku) or manual (AWS)
   - Database with test data
   - All 44 endpoints working
   - Monitoring and error tracking

✅ Production-ready frontend
   - Deployed to CDN
   - Optimized for performance
   - Connected to API
   - Auto-deploys on git push

✅ Custom domain (if configured)
   - HTTPS enabled
   - DNS configured
   - Professional appearance

✅ Monitoring & Alerting
   - Error tracking with Sentry
   - Uptime monitoring
   - Performance metrics
   - Slack notifications

✅ Documentation
   - Deployment guide (this file!)
   - Runbooks for common issues
   - API documentation
   - Scaling procedures
```

### Next Steps

```
1. Set up automatic database backups
2. Configure auto-scaling for traffic spikes
3. Implement advanced security measures
4. Plan feature releases
5. Monitor user behavior and metrics
6. Gather feedback and iterate
```

### Keeping Deployment Healthy

```bash
# Daily
- Check error logs
- Verify uptime status
- Check performance metrics

# Weekly
- Review disk usage
- Check security alerts
- Update documentation

# Monthly
- Analyze usage patterns
- Optimize slow queries
- Test disaster recovery
- Plan scaling improvements
```

---

## 📞 Support Resources

If you get stuck:

1. **Error in logs**: Check TROUBLESHOOTING section above
2. **API not responding**: Verify environment variables and database connection
3. **Frontend not loading**: Check browser console (F12) for errors
4. **Performance issues**: See MONITORING_AND_ALERTS.md
5. **Want to scale**: See SCALING_OPERATIONS.md
6. **Security concerns**: See ADVANCED_SECURITY_HARDENING.md

---

## 🎯 Quick Reference Commands

```bash
# Heroku Backend
heroku logs --tail                    # View logs
heroku config                         # View environment variables
heroku config:set KEY=VALUE           # Set variable
heroku run "npm run seed"             # Run seed script
heroku restart                        # Restart app

# AWS Backend
ssh -i key.pem ubuntu@ip              # Connect to server
pm2 logs                              # View logs
pm2 restart all                       # Restart app
sudo systemctl restart nginx          # Restart web server

# Vercel Frontend
vercel deploy                         # Manual deploy
vercel env pull                       # Get environment variables
vercel logs                           # View logs

# GitHub
git push origin main                  # Push to main branch
git push heroku main                  # Deploy to Heroku
```

---

**Deployment Walkthrough Complete! Your app is live! 🎉**

**Frontend**: https://farmer-support-app.vercel.app  
**Backend**: https://farmer-app-api.herokuapp.com  
**Monitoring**: https://sentry.io (if configured)  

---

*Last Updated: February 2026*  
*Status: Production Deployed ✅*  
*Version: 1.0.0*
