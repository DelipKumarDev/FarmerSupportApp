# Scaling Operations Guide

Comprehensive guide for scaling the Farmer Support & Marketplace Web App to handle increased traffic and data volume.

---

## Overview

This guide covers:
- Horizontal& vertical scaling strategies
- Database scaling techniques
- Caching layers and CDN
- Load balancing
- Microservices architecture (optional)
- Cost optimization
- Auto-scaling configuration

---

## 📊 Current Architecture Limits

### Single Instance Capacity
```
Current Setup (Single Server):
- API Requests: ~1000 req/sec
- Concurrent Connections: ~500-1000
- Response Time: 50-200ms
- Database Connections: 10-20
- Memory per instance: 512MB-1GB
```

### Performance Metrics
- Shared database connection pool
- Single Node.js process
- Local file storage (max 10GB)
- No caching layer
- No CDN distribution
- No load balancing

---

## 🔄 Horizontal Scaling (Add More Servers)

### 1. Load Balancing with Nginx

```nginx
# /etc/nginx/nginx.conf
upstream farmapp_backend {
    server backend1.example.com:5000 weight=1;
    server backend2.example.com:5000 weight=1;
    server backend3.example.com:5000 weight=1;
    
    # Use least connections algorithm
    least_conn;
    
    # Connection timeout
    keepalive 32;
}

server {
    listen 80;
    server_name api.farmapp.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.farmapp.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;
    
    location / {
        proxy_pass http://farmapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build frontend (if needed)
RUN npm run build --prefix frontend

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml for local multi-instance testing
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password

  backend_1:
    build: ./backend
    ports:
      - "5001:5000"
    environment:
      - MONGODB_URI=mongodb://root:password@mongodb:27017/farmer_app
      - NODE_ENV=production
      - PORT=5000
    depends_on:
      - mongodb
    restart: unless-stopped

  backend_2:
    build: ./backend
    ports:
      - "5002:5000"
    environment:
      - MONGODB_URI=mongodb://root:password@mongodb:27017/farmer_app
      - NODE_ENV=production
      - PORT=5000
    depends_on:
      - mongodb
    restart: unless-stopped

  backend_3:
    build: ./backend
    ports:
      - "5003:5000"
    environment:
      - MONGODB_URI=mongodb://root:password@mongodb:27017/farmer_app
      - NODE_ENV=production
      - PORT=5000
    depends_on:
      - mongodb
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - backend_1
      - backend_2
      - backend_3
    restart: unless-stopped

volumes:
  mongo_data:
```

### 3. Session Management Across Instances

Sessions must be shared across backend instances using Redis:

```bash
npm install redis express-session connect-redis
```

```javascript
// src/config/session.js
import redis from 'redis';
import session from 'express-session';
import RedisStore from 'connect-redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const redisStore = new RedisStore({ client: redisClient });

export const sessionConfig = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
});

// Usage
app.use(sessionConfig);
```

---

## 📦 Database Scaling

### 1. MongoDB Sharding

Enable sharding for large collections:

```javascript
// src/config/sharding.js
// Run once from MongoDB Atlas Console

// Enable sharding on database
db.admin().runCommand({ enableSharding: 'farmer_app' });

// Shard the largest collections
db.admin().runCommand({
  shardCollection: 'farmer_app.orders',
  key: { createdAt: 1 }  // Shard by date for time-based distribution
});

db.admin().runCommand({
  shardCollection: 'farmer_app.operands',
  key: { customerId: 1 }  // For customer lookups
});

db.admin().runCommand({
  shardCollection: 'farmer_app.farmProducts',
  key: { farmerId: 1 }   // For farmer products
});
```

### 2. Read Replicas

Use read replicas for heavy read operations:

```javascript
// src/config/database.js
const readConnectionString = process.env.MONGODB_REPLICA_URI || process.env.MONGODB_URI;

// Create separate Mongoose connection for reads
const readConnection = mongoose.createConnection(readConnectionString, {
  maxPoolSize: 50,  // Increase pool for read replica
  readPreference: 'secondary' // Read from secondary
});

// Use for heavy queries
export async function getOrdersReadReplica(customerId) {
  const Order = readConnection.model('Order', orderSchema);
  
  return Order.find({ customerId })
    .lean()
    .sort({ createdAt: -1 })
    .exec();
}
```

### 3. Query Optimization for Scale

```javascript
// For large result sets, use streaming
export async function streamLargeDataset(req, res) {
  const query = Order.find({ status: 'delivered' })
    .lean()
    .batchSize(1000)
    .cursor();
  
  res.setHeader('Content-Type', 'application/json');
  res.write('[\n');
  
  let first = true;
  query.on('data', (doc) => {
    if (!first) res.write(',\n');
    res.write(JSON.stringify(doc));
    first = false;
  });
  
  query.on('end', () => {
    res.write('\n]');
    res.end();
  });
  
  query.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
}
```

---

## 🚀 Caching Strategies

### 1. Redis Caching Layer

```bash
npm install redis
```

```javascript
// src/utils/cache.js
import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

client.on('error', (err) => console.error('Redis error:', err));

export async function getCacheOrCompute(key, computeFn, ttl = 3600) {
  try {
    // Try to get from cache
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  
  // Compute value
  const value = await computeFn();
  
  // Store in cache
  try {
    await client.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
  
  return value;
}

export async function invalidateCache(pattern) {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

// Usage
export const getCrops = async (req, res) => {
  try {
    const crops = await getCacheOrCompute(
      'all-crops',
      () => Crop.find().lean(),
      3600 // 1 hour TTL
    );
    
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Invalidate cache when data changes
export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body);
    
    // Invalidate related caches
    await invalidateCache('all-crops');
    await invalidateCache(`crop-${req.params.id}`);
    
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 2. Distributed Cache with Message Queue

For cache invalidation across multiple instances:

```bash
npm install bull redis
```

```javascript
// src/utils/cacheSync.js
import Queue from 'bull';

const cacheQueue = new Queue('cache-invalidation', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process invalidation requests
cacheQueue.process(async (job) => {
  const { pattern } = job.data;
  await invalidateCache(pattern);
  console.log(`✅ Cache invalidated: ${pattern}`);
});

// Request cache invalidation across all instances
export async function invalidateCacheAcrossInstances(pattern) {
  await cacheQueue.add({ pattern });
}
```

---

## 🌍 CDN & Static Asset Scale

### 1. Cloudflare CDN Configuration

```javascript
// vite.config.js with Cloudflare optimization
export default {
  build: {
    // Generate source maps only for errors
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        // Hash filenames for cache busting
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpg|svg|webp|gif)$/i.test(name ?? '')) {
            return 'images/[name].[hash][extname]';
          } else if (/\.css$/i.test(name ?? '')) {
            return 'css/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
};
```

### 2. Vercel Edge Functions (For Frontend)

```javascript
// vercel.json for Vercel deployment
{
  "buildCommand": "npm run build --prefix frontend",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": "@api_url"
  },
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
          "value": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}
```

---

## 📈 Auto-Scaling Configuration

### 1. Kubernetes Auto-Scaling

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: farmer-app-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: farmer-app-api
  template:
    metadata:
      labels:
        app: farmer-app-api
    spec:
      containers:
      - name: api
        image: your-registry/farmer-app:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: farmer-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: farmer-app-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. AWS Auto Scaling Group

```javascript
// Terraform configuration for AWS
resource "aws_autoscaling_group" "farmer_app" {
  name = "farmer-app-asg"
  vpc_zone_identifier = ["subnet-1", "subnet-2", "subnet-3"]
  
  min_size = 2
  max_size = 10
  desired_capacity = 3
  
  launch_configuration = aws_launch_configuration.farmer_app.id
  
  tag {
    key                 = "Name"
    value               = "farmer-app-instance"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name = "scale-up"
  scaling_adjustment = 1
  adjustment_type = "ChangeInCapacity"
  autoscaling_group_name = aws_autoscaling_group.farmer_app.name
  cooldown = 300
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name = "farmer-app-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = 2
  metric_name = "CPUUtilization"
  namespace = "AWS/EC2"
  period = 120
  statistic = "Average"
  threshold = 70
  alarm_actions = [aws_autoscaling_policy.scale_up.arn]
}
```

---

## 💰 Cost Optimization

### 1. Resource Right-Sizing

```
Current Usage Analysis:
- Average CPU: 25-30%
- Average Memory: 40-50%
- Peak Hours: 6-8 PM (2x traffic)
- Low Traffic: 2-5 AM (0.2x traffic)

Optimized Setup:
- Base instances: 2 (handles average load)
- Peak instances: 5-6 (handles peak hours)
- Off-peak instances: 1-2 (handles low traffic)

Cost Save: ~40% by using appropriate instance sizes and scaling
```

### 2. Database Cost Optimization

```javascript
// Archive old data to cheaper storage
async function archiveOldData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Move to archive collection (cheaper)
  const oldOrders = await Order.find({
    createdAt: { $lt: sixMonthsAgo },
    status: 'delivered'
  });
  
  if (oldOrders.length > 0) {
    await ArchivedOrder.insertMany(oldOrders);
    await Order.deleteMany({
      createdAt: { $lt: sixMonthsAgo },
      status: 'delivered'
    });
    
    console.log(`✅ Archived ${oldOrders.length} orders`);
  }
}

// Run monthly
cron.schedule('0 0 1 * *', archiveOldData);
```

### 3. Storage Optimization

Use S3 for file storage instead of local files:

```bash
npm install aws-sdk
```

```javascript
// src/middleware/upload.js with S3
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { userId: req.user.id });
    },
    key: (req, file, cb) => {
      const key = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, key);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

---

## 📊 Scaling Checklist

### Before Scaling
- [ ] Performance baselines established
- [ ] Bottlenecks identified
- [ ] Load testing completed
- [ ] Scalability plan documented
- [ ] Cost estimates calculated

### Horizontal Scaling
- [ ] Load balancer configured
- [ ] Session management centralized (Redis)
- [ ] Multiple backend instances deployed
- [ ] Health checks configured
- [ ] Monitoring in place

### Database Scaling
- [ ] Read replicas configured
- [ ] Sharding implemented (if needed)
- [ ] Connection pooling optimized
- [ ] Query optimization completed
- [ ] Backup strategy updated

### Caching
- [ ] Redis cluster deployed
- [ ] Cache strategy defined
- [ ] Cache invalidation implemented
- [ ] TTL values optimized
- [ ] Cache hit rate monitored

### CDN & Static Assets
- [ ] CDN configured
- [ ] Asset versioning implemented
- [ ] Cache headers optimized
- [ ] Compression enabled
- [ ] Performance verified

### Auto-Scaling
- [ ] Metrics defined
- [ ] Scaling policies configured
- [ ] Min/max replicas set
- [ ] Cost limits established
- [ ] Testing completed

---

## 🚀 Scaling Roadmap

### Phase 1: Foundation (Current → Month 1)
- Load balancer setup
- Redis caching layer
- Database optimization
- **Cost**: ~$200-300/month
- **Capacity**: 5,000-10,000 DAU

### Phase 2: Growth (Month 2-3)
- Auto-scaling enabled
- CDN deployment
- Database sharding
- **Cost**: ~$400-500/month
- **Capacity**: 50,000-100,000 DAU

### Phase 3: Scale (Month 4+)
- Multi-region deployment
- Database replication
- Advanced caching
- **Cost**: ~$800-1200/month
- **Capacity**: 500,000+ DAU

---

**Document Status**: ✅ Complete  
**Last Updated**: February 2026  
**Target Audience**: DevOps Engineers, System Architects, Infrastructure Teams
