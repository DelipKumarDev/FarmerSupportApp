# Final Run Instructions - Step 8

Complete instructions for running the complete Farmer Support & Marketplace Web App.

## Pre-Flight Checklist

Before running the application, verify:

- [ ] Node.js v16+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] MongoDB Atlas account created
- [ ] Database user created (farmerapp)
- [ ] IP whitelist configured
- [ ] Connection string obtained
- [ ] Git cloned or downloaded
- [ ] Terminal access available

---

## Quick Start (5 Minutes)

### Automated Setup
```bash
cd /workspaces/FarmerSupportApp
chmod +x setup.sh
./setup.sh
```

Then follow the prompts to configure MongoDB Atlas credentials.

### Manual Setup
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Configure environment variables:
- `backend/.env` - MongoDB connection string, JWT secret
- `frontend/.env` - API URL (usually http://localhost:5000/api)

---

## Step 1: Configure Environment Variables

### Backend Configuration

**File**: `backend/.env`

```
MONGODB_URI=mongodb+srv://farmerapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/farmersupportapp?retryWrites=true&w=majority
JWT_SECRET=your_random_32_character_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Get MongoDB Connection String:**
1. MongoDB Atlas Dashboard
2. Cluster → Connect
3. Connect your application
4. Copy full connection string
5. Replace `<password>` with your user password

**Generate JWT Secret:**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

**File**: `frontend/.env`

```
VITE_API_URL=http://localhost:5000/api
```

---

## Step 2: Seed Database (Optional but Recommended)

Creates test data for quick testing:

```bash
cd backend
npm run seed
```

**Creates:**
- ✅ 5 users (1 admin, 2 farmers, 2 customers)
- ✅ 4 crops (Wheat, Rice, Cotton, Tomato)
- ✅ 2 crop guides
- ✅ 2 discount codes
- ✅ 4 market prices

**Test Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@farmersupport.com | admin123 |
| Farmer 1 | rajesh@farmer.com | farmer123 |
| Farmer 2 | priya@farmer.com | farmer123 |
| Customer 1 | amit@customer.com | customer123 |
| Customer 2 | neha@customer.com | customer123 |

---

## Step 3: Start Backend Server

**Terminal 1:**

```bash
cd /workspaces/FarmerSupportApp/backend
npm run dev
```

**Expected Output:**
```
Server running on http://localhost:5000
Connected to MongoDB at mongodb+srv://...
```

**Verify with health check:**
```bash
curl http://localhost:5000/api/health
# Expected response: {"message":"Server is running","timestamp":"2024-XX-XX..."}
```

---

## Step 4: Start Frontend Server

**Terminal 2 (New Terminal):**

```bash
cd /workspaces/FarmerSupportApp/frontend
npm run dev
```

**Expected Output:**
```
VITE v4.4.9 ready in 123 ms

➜  Local:  http://localhost:5173/
```

---

## Step 5: Access Application

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the Farmer Support & Marketplace home page.

---

## Step 6: Test the Application

### Quick Test Workflow (10 minutes)

#### Test 1: Register & Login
1. Click "Login" button
2. Use test account: `rajesh@farmer.com` / `farmer123`
3. Click "Login"
4. **Expected**: Redirected to dashboard

#### Test 2: Explore Farmer Dashboard
1. You're now logged in as a farmer
2. Click "Dashboard" in navbar
3. **Expected**: See farmer-specific tiles
   - My Products
   - Market Prices
   - Crop Guidance
   - Disease Detection

#### Test 3: Browse Crop Guides
1. Click "Crop Guidance" card
2. Select "Wheat" from dropdown
3. **Expected**: See wheat cultivation guide

#### Test 4: Test Disease Detection
1. Go to "Marketplace" or navigate to `/disease-detection`
2. Select "Rice" from crop dropdown
3. Upload any image file
4. Click "Detect Disease"
5. **Expected**: See mock disease detection with confidence %

#### Test 5: Browse Marketplace
1. Go to Marketplace
2. **Expected**: Empty listing (no products created yet)
3. From Dashboard, create a new product
4. Refresh marketplace
5. **Expected**: Your product appears

#### Test 6: Admin Access
1. Logout (click Logout in navbar)
2. Login as admin: `admin@farmersupport.com` / `admin123`
3. Click "Admin Panel" in navbar
4. **Expected**: See dashboard with statistics
5. Click "Manage Users"
6. **Expected**: See all users in table

#### Test 7: Discounts
1. Logout and login as customer
2. Verify discount codes work
3. Try applying `FLAT500` discount code (if exists)

---

## Verify All Components

### Backend Status

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check specific endpoints
curl http://localhost:5000/api/crops

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@farmer.com","password":"farmer123"}'
```

### Frontend Status

Open browser DevTools (F12):
- **Console**: Should have no red errors
- **Network**: API calls should return 200 status
- **LocalStorage**: Should contain `token` and `user` after login

---

## Troubleshooting

### "Cannot connect to MongoDB"

**Error:**
```
MongooseError: Cannot connect to MongoDB
```

**Solution:**
```bash
# Verify .env file
cat backend/.env | grep MONGODB_URI

# Check MongoDB Atlas:
# 1. User created: Database Access tab
# 2. IP whitelisted: Network Access tab
# 3. Password correct in connection string
# 4. Database name matches (farmersupportapp)
```

### "CORS Error" in Browser

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
```bash
# 1. Ensure backend running
# 2. Ensure frontend .env has correct API URL
VITE_API_URL=http://localhost:5000/api

# 3. Restart both servers
```

### "Port already in use"

**Error:**
```
EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev  # backend
```

### "npm: command not found"

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Logout and login again, then:
npm --version
```

---

## Common Tasks

### Check Logs

**Backend logs:**
- Visible in Terminal 1 running `npm run dev`
- Shows requests, database operations, errors

**Frontend logs:**
- Browser DevTools → Console (F12)
- Terminal 2 running `npm run dev`

### Restart Servers

```bash
# Stop servers
# Press Ctrl+C in each terminal

# Restart backend
cd backend && npm run dev

# Restart frontend (in separate terminal)
cd frontend &&npm run dev
```

### Reset Database

```bash
cd backend
npm run seed  # This clears and recreates data
```

### Check Database Connection

```bash
cd backend
node -e "require('./src/config/database.js').then(() => console.log('✓ Connected'))"
```

---

## API Testing

### Use curl for API Testing

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Get All Crops:**
```bash
curl http://localhost:5000/api/crops
```

**Login (Get Token):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh@farmer.com",
    "password": "farmer123"
  }'

# Response includes: "token": "eyJ..."
# Save this token for authenticating other requests
```

**Use Token (Replace YOUR_TOKEN):**
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Full Feature Testing

### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "farmer",
    "phone": "9876543210",
    "city": "Delhi",
    "state": "Delhi"
  }'
```

### Get Market Prices
```bash
curl "http://localhost:5000/api/crops/prices?cropId=CROP_ID"
```

### Validate Discount Code
```bash
curl -X POST http://localhost:5000/api/discounts/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FLAT500",
    "role": "customer"
  }'
```

---

## Performance Check

### Frontend Performance

DevTools → Lighthouse:
1. Open http://localhost:5173
2. DevTools (F12) → Lighthouse
3. Click "Analyze page load"
4. Target scores:
   - Performance: 80+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

### API Response Times

Check DevTools → Network:
1. Monitor requests
2. API calls should respond in < 500ms
3. Page load should complete in < 3 seconds

---

## Security Checklist

Verify before production:

- [ ] JWT tokens expire after 7 days
- [ ] Passwords are hashed (check database)
- [ ] No sensitive data in localStorage except token
- [ ] CORS configured correctly
- [ ] Environment variables not committed to git
- [ ] Passwords not logged anywhere
- [ ] Database user permissions correct
- [ ] API validates all inputs
- [ ] Role-based access enforced
- [ ] File uploads validated

---

## Production Deployment

When ready to deploy:

### Backend Deployment (Heroku Example)
```bash
cd backend
# Add Procfile
echo "web: node src/server.js" > Procfile

# Set production variables (on Heroku dashboard)
heroku config:set \
  NODE_ENV=production \
  MONGODB_URI=<production_db_uri> \
  JWT_SECRET=<secure_secret> \
  FRONTEND_URL=<production_frontend_url>

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
cd frontend
# Build
npm run build

# Vercel automatically deploys
# Set environment variable
VITE_API_URL=<production_backend_url>
```

---

## Server Control

### Stop Servers
Press `Ctrl+C` in each terminal

### Run in Background
```bash
# Backend (background)
cd backend && npm run dev &

# Frontend (background)
cd ../frontend && npm run dev &

# List background jobs
jobs

# View specific job logs
fg %1
```

---

## Monitoring

### Watch for Errors
- Backend terminal: Check for red error messages
- Frontend console: DevTools → Console (F12)
- Browser Network: Check for 4xx or 5xx responses

### Check Database Size
MongoDB Atlas Dashboard:
- Cluster → Collections
- View data size and document count

### Monitor API Usage
MongoDB Atlas:
- Cluster → Monitoring
- Track read/write operations

---

## Documentation Reference

| File | Purpose | When to Use |
|------|---------|------------|
| QUICKSTART.md | Quick setup | First time setup |
| INTEGRATION_GUIDE.md | Detailed setup | Full documentation |
| TESTING_CHECKLIST.md | Test scenarios | Testing all features |
| ENDPOINTS.md | API reference | API development |
| FRONTEND_DOCUMENTATION.md | Frontend guide | Frontend troubleshooting |

---

## Support Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0

# Check for security vulnerabilities
npm audit

# Update packages
npm update

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **✅ Complete Setup** - Follow steps 1-5 above
2. **✅ Test Application** - Use step 6 test workflow
3. **✅ Verify Components** - Check all backend/frontend endpoints
4. **✅ Troubleshoot Issues** - Refer to troubleshooting section
5. **Deploy** - Follow production deployment section

---

## Success Indicators

All of these should work:

✅ **Backend**
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:5000/api/health` returns 200
- [ ] Database connected message appears

✅ **Frontend**
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:5173` loads in browser
- [ ] No red errors in console

✅ **Database**
- [ ] Seeding completes without errors
- [ ] Test accounts can login
- [ ] Data visible in MongoDB Atlas

✅ **Integration**
- [ ] Frontend communicates with backend
- [ ] API calls return correct data
- [ ] Authentication tokens issued and validated

---

**Version**: Step 8 Final

**Status**: Ready for Testing & Deployment

**Support**: See QUICKSTART.md or INTEGRATION_GUIDE.md for additional help
