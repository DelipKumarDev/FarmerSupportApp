# Quick Deployment Reference Guide

**Fast reference for deploying the Farmer Support & Marketplace Web App**

---

## ⚡ 30-Minute Express Deployment (Heroku + Vercel)

### Prerequisites
- Heroku account (heroku.com) → Free
- Vercel account (vercel.com) → Free
- GitHub account with code pushed
- MongoDB Atlas account with connection string

### Total Cost: ~$20/month (or FREE with free tiers)

---

## 🚀 BACKEND DEPLOYMENT (15 minutes)

### 1. Install & Login to Heroku
```bash
npm install -g heroku
heroku login
```

### 2. Create Backend App
```bash
cd backend
heroku create farmer-app-api
```

### 3. Set Environment Variables
```bash
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
heroku config:set JWT_SECRET="your-32-character-secret-key-12345"
heroku config:set NODE_ENV=production
```

### 4. Create Procfile
```bash
echo "web: npm start" > Procfile
git add Procfile
git commit -m "Add Procfile"
```

### 5. Deploy
```bash
git push heroku main
```

### 6. Verify
```bash
curl https://farmer-app-api.herokuapp.com/api/health
# Should return: {"status":"ok",...}
```

### 7. Seed Database
```bash
heroku run "npm run seed"
```

**✅ Backend Live at**: `https://farmer-app-api.herokuapp.com`

---

## 🎨 FRONTEND DEPLOYMENT (15 minutes)

### 1. Push Code to GitHub
```bash
git remote add origin https://github.com/USERNAME/FarmerSupportApp
git push -u origin main
```

### 2. Import to Vercel
```
vercel.com → Add Project → Import Git Repo
→ Select FarmerSupportApp → Continue
```

### 3. Configure
```
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
```

### 4. Set Env Variable
```
VITE_API_URL: https://farmer-app-api.herokuapp.com
```

### 5. Deploy
Click "Deploy" button

**✅ Frontend Live at**: `https://farmer-support-app.vercel.app`

---

## ✅ QUICK VERIFICATION

```bash
# Test Backend
curl https://farmer-app-api.herokuapp.com/api/health

# Test Frontend
# Open https://farmer-support-app.vercel.app in browser

# Try Login
Email: admin@farmersupport.com
Password: admin123
```

---

## 📊 QUICK MONITORING SETUP (5 minutes)

### Sentry (Error Tracking)
```
sentry.io → Create Project → Get DSN
→ Add to .env files → Restart
```

### Uptime Robot (Uptime Monitoring)
```
uptimerobot.com → Add Monitor
URL: https://farmer-app-api.herokuapp.com/api/health
```

### Email Alerts
```
Heroku Dashboard → Notifications → Email
Vercel Dashboard → Email Alerts
```

---

## 🔧 COMMON COMMANDS

| Task | Command |
|------|---------|
| View backend logs | `heroku logs --tail` |
| View all env vars | `heroku config` |
| Set env variable | `heroku config:set KEY=VALUE` |
| Restart backend | `heroku restart` |
| Redeploy frontend | Vercel: Click "Redeploy" button |
| Check backend health | `curl https://farmer-app-api.herokuapp.com/api/health` |

---

## 🆘 QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Backend won't start | `heroku logs --tail` and check MONGODB_URI |
| Frontend shows blank | Check VITE_API_URL in Vercel env variables |
| Login fails | Verify database was seeded with `heroku run "npm run seed"` |
| CORS errors | Backend is already configured with CORS for all origins |
| 404 on API | Verify URL is `https://farmer-app-api.herokuapp.com/api/...` |

---

## 📋 DEPLOYMENT CHECKLIST

```
Pre-Deployment:
☐ Code committed to git
☐ MongoDB Atlas cluster created
☐ Connection string tested locally

Backend (Heroku):
☐ Heroku account created and CLI installed
☐ App created with `heroku create`
☐ Environment variables set with `heroku config:set`
☐ Code pushed with `git push heroku main`
☐ Database seeded with `heroku run "npm run seed"`
☐ Health endpoint responds (200 OK)

Frontend (Vercel):
☐ Code pushed to GitHub
☐ Project imported to Vercel
☐ Build succeeds without errors
☐ VITE_API_URL set to backend URL
☐ Frontend loads in browser
☐ Login works with test account

Testing:
☐ Health check endpoint works
☐ User can login
☐ Dashboard loads data from API
☐ File uploads work
☐ No console errors

Monitoring:
☐ Error tracking configured (Sentry)
☐ Uptime monitoring configured (Uptime Robot)
☐ Email alerts configured
```

---

## 📱 USER CREDENTIALS FOR TESTING

### Admin Account
```
Email: admin@farmersupport.com
Password: admin123
Access: All admin features
```

### Farmer Account
```
Email: rajesh@farmer.com
Password: farmer123
Email: priya@farmer.com
Password: farmer123
Access: Product creation, order management
```

### Customer Account
```
Email: amit@customer.com
Password: customer123
Email: neha@customer.com
Password: customer123
Access: Marketplace, orders
```

---

## 🌍 CUSTOM DOMAIN (Optional)

### For Backend (API)
```
1. Domain Registrar → DNS Settings
2. Create CNAME record:
   Type: CNAME
   Host: api
   Value: farmer-app-api.herokuapp.com
3. Wait 5-10 minutes
4. Test: curl https://api.yourdomain.com/api/health
```

### For Frontend
```
1. Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter yourdomain.com
4. Follow DNS instructions
5. Wait for verification
```

---

## 💰 COST BREAKDOWN

| Service | Cost | Notes |
|---------|------|-------|
| Heroku Backend | $7-50/mo | Eco tier free for 1000 hours/month |
| Vercel Frontend | Free | Free tier generous ($0-20 if high usage) |
| MongoDB Atlas | Free | 512MB free tier |
| Sentry | Free | 5,000 errors/month free |
| Uptime Robot | Free | Basic monitoring free |
| **TOTAL** | **$7-70/mo** | **Or ~FREE with free tiers** |

---

## 🎓 SCALING (If Needed Later)

```bash
# Scale backend on Heroku
heroku dyno:scale web=3   # 3 instances instead of 1

# View current scaling
heroku ps

# Auto-scaling setup
# See SCALING_OPERATIONS.md for Kubernetes/AWS setup
```

---

## 📞 HELP & DOCUMENTATION

| Question | Reference |
|----------|-----------|
| Detailed deployment steps | DEPLOYMENT_WALKTHROUGH.md |
| Full deployment checklist | DEPLOYMENT_CHECKLIST.md |
| Performance optimization | PERFORMANCE_OPTIMIZATION_GUIDE.md |
| Monitoring & alerts | MONITORING_AND_ALERTS.md |
| Security hardening | ADVANCED_SECURITY_HARDENING.md |
| Scaling to millions of users | SCALING_OPERATIONS.md |
| API reference | ENDPOINTS.md |
| Frontend components | FRONTEND_DOCUMENTATION.md |

---

## ✨ SUCCESS INDICATORS

✅ **All Green = Live & Working**

```
Backend API:
  ✅ Health endpoint returns 200
  ✅ All -44 endpoints functional
  ✅ Database seeded with test data
  ✅ Logs show no errors

Frontend:
  ✅ Loads in < 3 seconds
  ✅ No console errors
  ✅ Can login with test account
  ✅ Dashboard loads API data

Database:
  ✅ MongoDB connection successful
  ✅ 10 collections created
  ✅ Test data inserted
  ✅ Queries complete in < 100ms

Monitoring:
  ✅ Error tracking active
  ✅ Uptime monitoring active
  ✅ Alerts configured
```

---

## 🎊 CONGRATULATIONS!

Your **Farmer Support & Marketplace Web App** is now **LIVE IN PRODUCTION**! 🎉

**Next Steps**:
1. Share the frontend URL with users
2. Monitor error logs and performance
3. Gather user feedback
4. Plan feature improvements
5. Scale infrastructure as needed

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Deployed ✅
