# Farmer Support & Marketplace - Quick Start Guide

Complete setup guide for running the Farmer Support & Marketplace Web App locally.

## Prerequisites

Before starting, ensure you have:
- **Node.js** v16 or higher - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** (free) - [Create account](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **A text editor** (VS Code, Sublime, etc.)

## Quick Setup (2 minutes)

### Automated Setup
If you're on macOS/Linux, run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Then skip to Step 3 below and finish configuration.

### Manual Setup
Proceed with the steps below.

---

## Step-by-Step Manual Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 2: MongoDB Atlas Configuration

#### 2.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" (or login if you have account)
3. Create organization → Create project → Build a Database
4. Choose "Shared" cluster (free tier)
5. Select AWS, region: N. Virginia
6. Click "Create Cluster" (waits 1-2 minutes)

#### 2.2 Create Database User
1. In MongoDB Atlas: Click "Database Access"
2. Click "Add New Database User"
3. Fill in:
   - Username: `farmerapp`
   - Password: Create strong password (save this!)
   - Built-in role: `Database User`
4. Click "Add User"

#### 2.3 Add Your IP
1. Click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### 2.4 Get Connection String
1. On Dashboard, click "Connect" button on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your user password
5. Replace `myFirstDatabase` with `farmersupportapp`

**Example connection string:**
```
mongodb+srv://farmerapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/farmersupportapp?retryWrites=true&w=majority
```

### Step 3: Configure Environment Variables

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with these values:
```
MONGODB_URI=mongodb+srv://farmerapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/farmersupportapp?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_string_at_least_32_chars
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Generate secure JWT_SECRET:**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` (usually correct by default):
```
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Seed Sample Data (Optional but Recommended)

Create sample users, products, and orders for testing:

```bash
cd backend
npm run seed
```

**Test Accounts Created:**
- **Admin**: admin@farmerapp.com / TestPassword123
- **Farmer 1**: farmer1@example.com / TestPassword123
- **Farmer 2**: farmer2@example.com / TestPassword123
- **Customer 1**: customer1@example.com / TestPassword123
- **Customer 2**: customer2@example.com / TestPassword123

### Step 5: Run Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Connected to MongoDB
```

#### Terminal 2 - Frontend Server (New Terminal)
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v4.4.9 ready

➜ Local: http://localhost:5173/
```

### Step 6: Open Application

Open your browser and go to:
```
http://localhost:5173
```

**You're done! The app is running.** 🎉

---

## First Steps After Setup

### Test the Application

1. **Register a new account:**
   - Click "Register"
   - Fill in form with any email/password
   - Choose "farmer" as role
   - Click "Register"

2. **Or login with test account:**
   - Click "Login"
   - Email: `farmer1@example.com`
   - Password: `TestPassword123`
   - Click "Login"

3. **Explore features:**
   - View crop guides
   - Check marketplace
   - Try disease detection
   - Create a product (if farmer)

4. **Admin access:**
   - Login as `admin@farmerapp.com` / `TestPassword123`
   - Click "Admin Panel" in navbar
   - View dashboard statistics
   - Manage users and discounts

---

## Common Tasks

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Check for TypeScript/ESLint Errors
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Reset Database
```bash
cd backend
# Add --force flag if needed
npm run seed
```

### View Logs
```bash
# Backend logs visible in terminal running 'npm run dev'
# Frontend errors visible in:
# 1. Browser console (F12)
# 2. Terminal running 'npm run dev'
```

### Stop Servers
Press `Ctrl+C` in each terminal running a server

---

## Troubleshooting

### "Cannot connect to MongoDB"

**Error in console:**
```
Error connecting to MongoDB
```

**Solution:**
1. Verify MongoDB connection string in `.env`
2. Check MongoDB Atlas:
   - User exists: Database Access tab
   - Password correct in connection string
   - IP whitelisted: Network Access tab
3. Restart backend: `npm run dev`

### "CORS Error from Frontend"

**Error in browser console:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:**
1. Backend server MUST be running on port 5000
2. Check frontend `.env` has: `VITE_API_URL=http://localhost:5000/api`
3. Restart both servers

### "Port 5000/5173 Already in Use"

**Error:**
```
EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev  # backend
```

### "Module not found" Error

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "npm: command not found"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal
3. Verify: `npm --version`

---

## Project Structure

```
FarmerSupportApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/             # Business logic (8 files)
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT & role checking
│   │   │   └── upload.js            # File upload config
│   │   ├── models/                  # Database schemas (10 files)
│   │   ├── routes/                  # API routes (8 files)
│   │   ├── utils/
│   │   │   ├── jwt.js               # Token utilities
│   │   │   └── password.js          # Hashing utilities
│   │   └── server.js                # Express app
│   ├── uploads/                     # Uploaded files
│   ├── package.json
│   ├── .env.example
│   └── seedDatabase.js              # Sample data generator
│
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Page components (12 files)
│   │   ├── api.js                   # API client
│   │   ├── App.jsx                  # Main component
│   │   ├── App.css                  # Styles
│   │   ├── index.css                # Tailwind imports
│   │   ├── main.jsx                 # Entry point
│   │   └── index.html               # HTML template
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js
│   ├── .env.example
│   └── index.html
│
├── README.md                         # Project overview
├── QUICKSTART.md                     # This file
├── INTEGRATION_GUIDE.md              # Detailed setup & testing
├── TESTING_CHECKLIST.md              # Complete test scenarios
├── ENDPOINTS.md                      # API endpoint reference
├── FRONTEND_DOCUMENTATION.md         # Frontend architecture
├── setup.sh                          # Automated setup script
└── .gitignore
```

---

## Features Overview

### For Farmers 👨‍🌾
- ✅ Product creation and listing
- ✅ Marketplace access
- ✅ Disease detection
- ✅ Market price tracking
- ✅ Order management
- ✅ Value addition guides

### For Customers 🛒
- ✅ Browse farm products
- ✅ Add to cart and checkout
- ✅ Apply discount codes
- ✅ Track orders
- ✅ View order history
- ✅ Disease detection

### For Admin 👨‍💼
- ✅ Dashboard with statistics
- ✅ User management
- ✅ Discount code management
- ✅ Value addition content
- ✅ System analytics
- ✅ User deactivation

### Public Features 🌐
- ✅ View crop guides
- ✅ Browse marketplace
- ✅ Check market prices
- ✅ User registration

---

## Useful URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |
| MongoDB Atlas | https://cloud.mongodb.com |
| Node.js Docs | https://nodejs.org/docs |
| React Docs | https://react.dev |

---

## Next Steps

1. **Read the docs:**
   - `INTEGRATION_GUIDE.md` - Detailed setup and configuration
   - `TESTING_CHECKLIST.md` - Testing all features
   - `ENDPOINTS.md` - API reference
   - `FRONTEND_DOCUMENTATION.md` - Frontend details

2. **Run tests:**
   ```bash
   cd backend
   npm test  # When tests are added
   ```

3. **Deploy to production:**
   - Follow deployment guides on Heroku/Vercel/AWS
   - Set environment variables on hosting platform
   - Create MongoDB production database
   - Update CORS origins in production

4. **Customize:**
   - Update colors in `frontend/tailwind.config.js`
   - Modify product categories in database models
   - Add more features based on requirements

---

## Getting Help

1. **Check logs**: Look at terminal output for error messages
2. **Check documentation**: See `INTEGRATION_GUIDE.md` section "Troubleshooting"
3. **Test API directly**: Use `curl` commands from `ENDPOINTS.md`
4. **Check Network tab**: Developer Tools → Network → See actual errors
5. **Review code**: Check `backend/src/controllers/` for business logic

---

## Production Deployment

When ready to deploy:

**Backend:**
- Set NODE_ENV=production
- Use production MongoDB connection
- Set secure JWT_SECRET
- Configure production CORS origins
- Enable HTTPS/SSL
- Set up monitoring and logging

**Frontend:**
- Run `npm run build`
- Deploy build/ directory to CDN/hosting
- Set VITE_API_URL to production backend
- Enable caching headers

See deployment guides in cloud provider documentation.

---

## System Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend | ✅ Ready | Node.js + Express + MongoDB |
| Frontend | ✅ Ready | React + Vite + Tailwind |
| Database | ✅ Ready | 10 collections with relationships |
| Authentication | ✅ Ready | JWT + bcrypt + roles |
| Admin Panel | ✅ Ready | Dashboard + user/discount/content management |
| Testing | ✅ Ready | Comprehensive checklist provided |
| Documentation | ✅ Complete | 5 detailed guides included |

---

**Version**: Step 7 Complete ✅

**Last Updated**: Latest build

**Support**: See documentation files for detailed help
