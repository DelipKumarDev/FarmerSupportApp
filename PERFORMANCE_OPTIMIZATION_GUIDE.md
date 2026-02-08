# Performance Optimization Guide

Comprehensive guide to optimizing the Farmer Support & Marketplace Web App for maximum performance, scalability, and user experience.

---

## Overview

This guide covers performance optimization across all layers:
- **Frontend**: React, asset optimization, caching
- **Backend**: API response times, database queries
- **Database**: Indexing, query optimization
- **Infrastructure**: CDN, caching strategies, compression

---

## 🎨 Frontend Performance Optimization

### 1. Image Optimization

#### Tools
```bash
# Install image optimization tools
npm install --save-dev sharp imagemin imagemin-webp imagemin-mozjpeg
```

#### Implementation

Create `scripts/optimize-images.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../src/assets/images');

async function optimizeImages() {
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, `optimized-${file}`);
    
    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath.replace(/\.[^.]+$/, '.webp'));
    
    // Optimize JPEG
    await sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    console.log(`Optimized: ${file}`);
  }
}

optimizeImages().catch(console.error);
```

#### Update package.json
```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js",
    "build": "npm run optimize-images && vite build"
  }
}
```

#### Image Serving Strategy
```jsx
// Create ImageOptimized.jsx component
export function OptimizedImage({ src, alt, ...props }) {
  const webpSrc = src.replace(/\.[^.]+$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} loading="lazy" {...props} />
    </picture>
  );
}
```

### 2. Code Splitting & Lazy Loading

#### Dynamic Imports
```jsx
// App.jsx - Lazy load pages
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Routes>
    </Suspense>
  );
}
```

#### Vite Configuration
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react'],
          'api': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

### 3. Browser Caching Strategy

#### Service Worker (Optional PWA Enhancement)
```javascript
// public/sw.js
const CACHE_NAME = 'farmer-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

#### HTTP Headers Configuration
```javascript
// In Vite config or server middleware
export default {
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  },
  server: {
    middlewares: [
      (req, res, next) => {
        // Cache assets for 1 year
        if (/\.(js|css|woff2)$/.test(req.url)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Revalidate HTML daily
        if (req.url.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        next();
      }
    ]
  }
};
```

### 4. CSS & Bundle Optimization

#### CSS Minification (Automatic with Vite)
```javascript
// vite.config.js
export default {
  build: {
    cssCodeSplit: true,
    minify: 'terser'
  }
};
```

#### Remove Unused CSS
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {}
  }
};
```

### 5. Font Optimization

#### Font Loading Strategy
```jsx
// In index.css or App.jsx
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* Use font-display: swap for better performance */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
```

#### Preload Critical Fonts
```jsx
// In index.html
<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin />
```

---

## 🔧 Backend Performance Optimization

### 1. Database Query Optimization

#### Indexing Strategy

**Create indexes in seedDatabase.js or separate migration:**

```javascript
// src/config/database.js - Add after connection
async function createIndexes() {
  const User = mongoose.model('User');
  const Crop = mongoose.model('Crop');
  const Order = mongoose.model('Order');
  const FarmProduct = mongoose.model('FarmProduct');
  
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ role: 1 });
  
  // Crop indexes
  await Crop.collection.createIndex({ name: 1 }, { unique: true });
  await Crop.collection.createIndex({ season: 1 });
  
  // Order indexes
  await Order.collection.createIndex({ customerId: 1 });
  await Order.collection.createIndex({ farmerId: 1 });
  await Order.collection.createIndex({ status: 1 });
  await Order.collection.createIndex({ createdAt: -1 });
  
  // Product indexes
  await FarmProduct.collection.createIndex({ farmerId: 1 });
  await FarmProduct.collection.createIndex({ cropId: 1 });
  
  console.log('✅ All indexes created successfully');
}
```

#### Query Optimization Examples

**Before (Slow)**:
```javascript
// Multiple queries - N+1 problem
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id });
    
    for (let order of orders) {
      const farmer = await User.findById(order.farmerId);
      order.farmerName = farmer.name;
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**After (Fast with Populate)**:
```javascript
// Single query with population
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('farmerId', 'name email phone')
      .populate('items.productId', 'name basePrice')
      .lean() // Returns plain objects, faster
      .exec();
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Optimization techniques:**
```javascript
// 1. Use .lean() for read-only queries
const products = await FarmProduct.find().lean();

// 2. Select only needed fields
const users = await User.find()
  .select('name email role phone')
  .limit(100);

// 3. Use aggregation for complex queries
const stats = await Order.aggregate([
  { $match: { status: 'delivered' } },
  { $group: { 
      _id: '$farmerId', 
      totalRevenue: { $sum: '$totalAmount' },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);

// 4. Pagination for large datasets
const page = req.query.page || 1;
const limit = 20;
const skip = (page - 1) * limit;

const orders = await Order.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
```

### 2. API Response Caching

#### Redis Installation (Optional)
```bash
# Install Redis client
npm install redis

# Or use MongoDB for caching
npm install cache-manager cache-manager-mongodb
```

#### Caching Implementation

**Simple in-memory caching:**
```javascript
// src/middleware/cache.js
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function cacheMiddleware(key) {
  return (req, res, next) => {
    const cachedData = cache.get(key);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.data);
    }
    
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };
    
    next();
  };
}

// Usage
router.get('/crops', cacheMiddleware('crops'), getAllCrops);
```

**Cache invalidation:**
```javascript
// When data changes, clear related caches
async function updateCrop(req, res) {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body);
    
    // Invalidate caches
    cache.delete('crops');
    cache.delete(`crop-${req.params.id}`);
    
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 3. HTTP Compression

#### Enable Gzip Compression
```javascript
// src/server.js
import compression from 'compression';

app.use(compression()); // Compress all responses

// Or selective compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### 4. API Response Optimization

#### Pagination Template
```javascript
// src/utils/pagination.js
export async function paginate(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const total = await query.model.countDocuments(query.getFilter());
  const data = await query.skip(skip).limit(limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

// Usage
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await paginate(
      Order.find({ customerId: req.user.id }).sort({ createdAt: -1 }),
      page,
      limit
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🗄️ Database Performance Optimization

### 1. Connection Pooling

```javascript
// src/config/database.js
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,        // For read-heavy operations
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
});
```

### 2. Aggregation Pipeline vs Query

**Complex aggregation example:**
```javascript
// Get dashboard statistics efficiently
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { 
        $facet: {
          totalOrders: [
            { $count: 'count' }
          ],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          orderByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          topCrops: [
            { $unwind: '$items' },
            { $group: { 
                _id: '$items.cropId',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);
    
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Data Archiving

```javascript
// Archive old orders (monthly job)
async function archiveOldOrders() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const oldOrders = await Order.find({ 
    createdAt: { $lt: sixMonthsAgo },
    status: 'delivered'
  });
  
  // Move to archive collection
  await ArchivedOrder.insertMany(oldOrders);
  
  // Delete from main collection
  await Order.deleteMany({
    createdAt: { $lt: sixMonthsAgo },
    status: 'delivered'
  });
  
  console.log(`✅ Archived ${oldOrders.length} orders`);
}
```

---

## 🌐 Infrastructure & CDN Optimization

### 1. Content Delivery Network (CDN)

#### Vercel CDN (Built-in)
```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/assets/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

#### Cloudflare CDN (Free Tier)
```
1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers
4. Enable:
   - Automatic Minification
   - Caching Level: Standard
   - Browser Caching TTL: 30 days
   - Gzip Compression
```

### 2. Static Asset Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'images/[name].[hash][extname]';
          } else if (/\.css$/.test(name ?? '')) {
            return 'css/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
};
```

---

## ⚡ Performance Monitoring & Metrics

### 1. Frontend Performance

#### Lighthouse Integration
```bash
# Install Lighthouse CI
npm install --save-dev @lhci/cli@0.11.x @lhci/config-builder@0.11.x

# Create lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "staticDistDir": "./dist"
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

#### Core Web Vitals Tracking
```javascript
// src/utils/metrics.js
export function initWebVitals() {
  // LCP - Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
  });
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
  
  // FID - First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingDuration);
    }
  }).observe({ entryTypes: ['first-input'] });
  
  // CLS - Cumulative Layout Shift
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('CLS:', entry.value);
    }
  }).observe({ entryTypes: ['layout-shift'] });
}
```

### 2. Backend Performance Monitoring

#### APM Setup (Application Performance Monitoring)

**Using Elastic APM (Free tier):**
```bash
npm install elastic-apm-node
```

```javascript
// src/server.js (First line)
const apm = require('elastic-apm-node').start({
  serviceName: 'farmer-app-api',
  serverUrl: process.env.ELASTIC_APM_URL || 'http://localhost:8200'
});

app.use(apm.middleware.express());
```

**Query Performance Logging:**
```javascript
// src/middleware/queryPerformance.js
export function queryPerformanceMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 500ms)
    if (duration > 500) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
}
```

---

## 📊 Performance Benchmarks & Targets

### Frontend Targets
```
Metric              Target    Current
────────────────────────────────────
Lighthouse Score    > 90      [Check]
LCP (Largest)       < 2.5s    [Check]
FID (Input)         < 100ms   [Check]
CLS (Layout)        < 0.1     [Check]
FCP (First Paint)   < 1.8s    [Check]
Bundle Size         < 300KB   [Check]
```

### Backend Targets
```
Metric              Target    Current
────────────────────────────────────
API Response        < 200ms   [Check]
Database Query      < 100ms   [Check]
99th Percentile     < 500ms   [Check]
Throughput          > 1000rps [Check]
```

---

## 🔍 Performance Debugging

### Enable Slow Query Logging

```javascript
// src/config/database.js
mongoose.connection.on('open', () => {
  if (process.env.NODE_ENV === 'production') {
    // Enable slow query logging in MongoDB
    const adminDb = mongoose.connection.getClient().admin();
    adminDb.setProfilingLevel('slow_only', {}, (err) => {
      if (!err) console.log('✅ Slow query profiling enabled');
    });
  }
});
```

### Chrome DevTools Performance Recording

```javascript
// In frontend development
// 1. Open DevTools → Performance tab
// 2. Click Record
// 3. Perform user actions
// 4. Click Stop
// 5. Analyze results for bottlenecks
```

---

## 📈 Optimization Checklist

### Frontend
- [ ] Images optimized and served as WebP
- [ ] Code splits applied to pages
- [ ] Lazy loading on routes
- [ ] CSS minified and purged
- [ ] Fonts preloaded
- [ ] Service Worker configured
- [ ] Lighthouse score > 90
- [ ] Bundle size < 300KB

### Backend
- [ ] Database indexes created
- [ ] N+1 query problems fixed
- [ ] Caching implemented
- [ ] Gzip compression enabled
- [ ] Pagination added to list endpoints
- [ ] Slow query logging enabled
- [ ] Connection pooling configured
- [ ] API response time < 200ms

### Infrastructure
- [ ] CDN configured
- [ ] Static asset caching
- [ ] Dynamic content revalidation
- [ ] Monitoring in place
- [ ] Alerting configured
- [ ] Load testing done
- [ ] Scaling plan documented

---

## 🚀 Performance Testing Tools

```bash
# Install load testing tool
npm install -g artillery

# Create load test
artillery quick --count 100 --num 50 http://localhost:5000/api/crops

# Or use detailed config (artillery.yml)
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'API Load Test'
    flow:
      - get:
          url: '/api/crops'
          expect:
            - statusCode: 200
```

---

## 📦 Production Optimization Checklist

Before deploying to production:

- [ ] Minification enabled for JS/CSS
- [ ] Images optimized and size-reduced
- [ ] Unused dependencies removed
- [ ] Lazy routes implemented
- [ ] Database indexes verified
- [ ] Caching strategy in place
- [ ] CDN configured
- [ ] Compression enabled on backend
- [ ] Slow query logging enabled
- [ ] Performance monitoring configured
- [ ] Lighthouse score verified
- [ ] Load testing completed
- [ ] Security headers set
- [ ] HTTPS enforced
- [ ] Rate limiting configured

---

**Document Status**: ✅ Complete  
**Last Updated**: February 2026  
**Target Audience**: Developers, DevOps Engineers, Performance Engineers
