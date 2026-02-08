# Monitoring & Alerts Setup Guide

Comprehensive guide for setting up production monitoring, error tracking, and alerting for the Farmer Support & Marketplace Web App.

---

## Overview

This guide covers:
- Error monitoring and tracking
- Performance monitoring
- Uptime and availability monitoring
- Custom metrics and alerts
- Logging aggregation
- Dashboard creation
- Integration with Slack/Email

---

## 🔴 Error Monitoring with Sentry

### 1. Sentry Setup

#### Create Account
```bash
# Visit sentry.io and create free account
# Free tier includes: 5,000 errors/month, unlimited projects, 90-day data retention
```

#### Backend Integration

**Installation:**
```bash
npm install @sentry/node @sentry/tracing
```

**Configuration (src/server.js):**
```javascript
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

const app = express();

// Initialize Sentry early
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app: true,
      request: true,
      transaction: true,
    })
  ]
});

// Trace requests
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Error handler (MUST be after all routes)
app.use(Sentry.Handlers.errorHandler());

// Custom error handler
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
    requestId: Sentry.lastEventId()
  });
});
```

#### Frontend Integration

**Installation:**
```bash
npm install @sentry/react @sentry/tracing
```

**Configuration (src/main.jsx):**
```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import ReactDOM from "react-dom/client";
import App from "./App";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        window.history
      ),
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
    <App />
  </Sentry.ErrorBoundary>
);
```

#### Environment Variables
```bash
# .env (Backend)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# .env (Frontend)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

#### Custom Error Tracking

```javascript
// Capture specific errors
try {
  await uploadFile(file);
} catch (error) {
  Sentry.captureException(error, {
    contexts: {
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    },
    tags: {
      upload_type: 'product_image'
    }
  });
}

// Capture messages
Sentry.captureMessage('User registered successfully', 'info', {
  user_id: user.id,
  email: user.email
});

// Release tracking
Sentry.captureException(error, {
  release: '1.0.0'
});
```

---

## 📊 Performance Monitoring with Datadog

### 1. Datadog Setup (Free Trial)

#### Installation

**Backend:**
```bash
npm install dd-trace
```

**Configuration (src/server.js - first line):**
```javascript
// Initialize tracer BEFORE any other code
require('dd-trace').init({
  service: 'farmer-app-api',
  env: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  logInjection: true,
  appsec: {
    enabled: true
  }
});

// Rest of server setup...
import express from 'express';
const app = express();
```

**Environment Variables:**
```bash
# .env
DD_AGENT_HOST=localhost
DD_AGENT_PORT=8126
DD_TRACE_ENABLED=true
DD_SERVICE=farmer-app-api
DD_ENV=production
```

#### Datadog Agent Installation

```bash
# Mac
brew install datadog-agent

# Linux
sudo apt-get update
sudo apt-get install datadog-agent

# Start agent
sudo systemctl start datadog-agent

# Enable on startup
sudo systemctl enable datadog-agent
```

#### Configuration

```yaml
# /etc/datadog-agent/datadog.yaml
api_key: YOUR_DATADOG_API_KEY
site: datadoghq.com

logs:
  enabled: true

apm:
  enabled: true
  env: production

process_config:
  enabled: true
```

### 2. Custom Metrics

```javascript
// src/utils/metrics.js
const StatsD = require('node-dogstatsd').StatsD;

const metrics = new StatsD({
  host: 'localhost',
  port: 8125
});

// Track API response times
export function trackAPIMetric(endpoint, duration, statusCode) {
  metrics.timing(`api.response_time`, duration, {
    endpoint,
    status: statusCode
  });
  
  metrics.increment(`api.requests`, {
    endpoint,
    status: statusCode
  });
}

// Track database operations
export function trackDatabaseMetric(operation, duration, collection) {
  metrics.timing(`database.query_time`, duration, {
    operation,
    collection
  });
}

// Track business metrics
export function trackBusinessMetric(eventName, value, tags = {}) {
  metrics.gauge(`business.${eventName}`, value, tags);
}

// Usage in controllers
export const getAllCrops = async (req, res) => {
  const start = Date.now();
  
  try {
    const crops = await Crop.find().lean();
    
    const duration = Date.now() - start;
    trackAPIMetric('/crops', duration, 200);
    
    res.json(crops);
  } catch (error) {
    trackAPIMetric('/crops', Date.now() - start, 500);
    res.status(500).json({ error: error.message });
  }
};
```

---

## 📈 Uptime Monitoring

### 1. Uptime Robot (Free)

#### Setup
```
1. Visit uptimerobot.com
2. Create free account
3. Add new monitor
4. Select "HTTP(s)"
5. Enter URL: https://api.yourapp.com/health
6. Set check frequency: 5 minutes
7. Add alert emails
```

#### Health Check Endpoint

```javascript
// src/routes/healthRoutes.js
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Detailed health check
router.get('/health/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await mongoose.connection.db.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        database: dbCheck ? 'ok' : 'down',
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

#### Add to server.js routing
```javascript
import healthRoutes from './routes/healthRoutes.js';
app.use('/api', healthRoutes);
```

### 2. Ping Monitoring

```javascript
// Monitor specific endpoints
const healthEndpoints = [
  'https://api.yourapp.com/health',
  'https://api.yourapp.com/crops',
  'https://App.yourapp.com/'
];

async function monitorHealth() {
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.ok ? 'up' : 'down';
      
      console.log(`${endpoint}: ${status}`);
      
      if (!response.ok) {
        // Send alert
        await sendAlert({
          service: endpoint,
          status: 'down',
          statusCode: response.status
        });
      }
    } catch (error) {
      console.error(`${endpoint}: error - ${error.message}`);
      
      await sendAlert({
        service: endpoint,
        status: 'error',
        error: error.message
      });
    }
  }
}

// Run every 5 minutes
setInterval(monitorHealth, 5 * 60 * 1000);
```

---

## 📝 Centralized Logging

### 1. Structured Logging

```javascript
// src/utils/logger.js
export class Logger {
  static info(message, context = {}) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
  
  static error(message, error, context = {}) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
  
  static warn(message, context = {}) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
  
  static debug(message, context = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...context
      }));
    }
  }
}

// Usage
import { Logger } from './utils/logger.js';

Logger.info('User registered', {
  userId: user.id,
  email: user.email
});

Logger.error('Database error', error, {
  operation: 'findUser',
  userId: id
});
```

### 2. Log Aggregation with ELK Stack (Optional)

#### Quick Setup with Docker

```yaml
# docker-compose.yml for ELK
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=['http://elasticsearch:9200']

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    ports:
      - "5000:5000/udp"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

volumes:
  elasticsearch_data:
```

#### Send logs to Elasticsearch

```javascript
// src/utils/elasticLogger.js
import Client from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

export async function logToElastic(index, document) {
  try {
    await client.index({
      index: `logs-${index}-${new Date().toISOString().split('T')[0]}`,
      body: {
        ...document,
        '@timestamp': new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log to Elasticsearch:', error);
  }
}

// Usage
logToElastic('api', {
  endpoint: '/crops',
  method: 'GET',
  statusCode: 200,
  duration: 45,
  userId: user.id
});
```

---

## 🔔 Alert Configuration

### 1. Slack Integration

#### Setup Webhook

```
1. Go to api.slack.com/apps
2. Create New App → From scratch
3. App name: "Farmer App Alerts"
4. Select workspace
5. Go to "Incoming Webhooks"
6. Toggle "Activate Incoming Webhooks"
7. Click "Add New Webhook to Workspace"
8. Select channel: #alerts
9. Copy Webhook URL
```

#### Send Alerts

```javascript
// src/utils/slack.js
export async function sendSlackAlert(message, severity = 'info', context = {}) {
  const color = {
    critical: 'danger',
    warning: 'warning',
    info: 'good'
  }[severity];
  
  const payload = {
    attachments: [
      {
        color,
        title: `${severity.toUpperCase()}: ${message}`,
        text: JSON.stringify(context, null, 2),
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// Usage
import { sendSlackAlert } from './utils/slack.js';

// High error rate alert
if (errorCount > 10) {
  await sendSlackAlert(
    'High error rate detected',
    'critical',
    { errorCount, duration: '5 minutes' }
  );
}

// Low database connection alert
if (mongooseConnected === false) {
  await sendSlackAlert(
    'Database connection lost',
    'critical',
    { error: 'Cannot reach MongoDB' }
  );
}
```

### 2. Email Alerts

```javascript
// src/utils/emailAlerts.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD
  }
});

export async function sendEmailAlert(subject, message, severity = 'info') {
  const html = `
    <h2 style="color: ${severity === 'critical' ? 'red' : 'orange'}">
      ${subject}
    </h2>
    <p>${message}</p>
    <p><small>Alert Time: ${new Date().toISOString()}</small></p>
  `;
  
  try {
    await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to: process.env.ALERT_EMAIL_TO,
      subject: `[${severity.toUpperCase()}] ${subject}`,
      html
    });
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}
```

### 3. Custom Alert Rules

```javascript
// src/services/alerting.js
class AlertManager {
  constructor() {
    this.thresholds = {
      errorRate: 5,           // errors per minute
      responseTime: 2000,     // milliseconds
      cpuUsage: 80,          // percentage
      memoryUsage: 85,       // percentage
      databaseConnections: 10 // max connections
    };
  }
  
  async checkErrorRate(errors) {
    const rate = errors / 60; // per minute
    
    if (rate > this.thresholds.errorRate) {
      await sendSlackAlert(
        `High error rate: ${rate.toFixed(2)}/min`,
        'critical'
      );
    }
  }
  
  async checkResponseTime(endpoints) {
    for (const [endpoint, time] of Object.entries(endpoints)) {
      if (time > this.thresholds.responseTime) {
        await sendSlackAlert(
          `Slow API endpoint: ${endpoint}`,
          'warning',
          { responseTime: time }
        );
      }
    }
  }
  
  async checkSystemResources(metrics) {
    if (metrics.cpuUsage > this.thresholds.cpuUsage) {
      await sendSlackAlert(
        `High CPU usage: ${metrics.cpuUsage}%`,
        'warning'
      );
    }
    
    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      await sendSlackAlert(
        `High memory usage: ${metrics.memoryUsage}%`,
        'warning'
      );
    }
  }
}

export const alertManager = new AlertManager();
```

---

## 📊 Dashboard Setup

### 1. Datadog Dashboard Example

```yaml
# Dashboard Configuration
title: "Farmer App - Production Monitoring"
description: "Real-time monitoring of API health, performance, and errors"
widgets:
  - type: "timeseries"
    title: "API Response Times"
    queries:
      - metric: "api.response_time"
        aggregator: "avg"
    
  - type: "timeseries"
    title: "Error Rate"
    queries:
      - metric: "error_rate"
        aggregator: "sum"
    
  - type: "gauge"
    title: "Database Connection Pool"
    queries:
      - metric: "db.connections.active"
  
  - type: "heatmap"
    title: "Request Latency Distribution"
    queries:
      - metric: "http.request.duration"
  
  - type: "number"
    title: "Total Orders (24h)"
    queries:
      - metric: "business.orders.created"
        aggregator: "sum"
```

### 2. Kibana Dashboard (ELK)

```javascript
// Create Kibana dashboard via REST API
const dashboard = {
  title: "Farmer App Logs",
  panels: [
    {
      id: "1",
      type: "visualization",
      visualization: {
        title: "Errors by Endpoint",
        type: "pie",
        kibanaSavedObjectMeta: {
          searchSourceJSON: {
            index: "logs-*",
            query: {
              match: { level: "error" }
            }
          }
        }
      }
    }
  ]
};
```

---

## 🔐 Security Monitoring

### Monitor Failed Login Attempts

```javascript
// src/utils/securityMonitoring.js
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export async function trackLoginAttempt(email, success) {
  const key = email;
  
  if (!success) {
    const attempts = failedAttempts.get(key) || [];
    attempts.push(Date.now());
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      time => Date.now() - time < ATTEMPT_WINDOW
    );
    
    if (recentAttempts.length > MAX_ATTEMPTS) {
      await sendSlackAlert(
        `Multiple failed login attempts for ${email}`,
        'warning',
        { attempts: recentAttempts.length }
      );
      
      // Optionally lock account
      await User.findOneAndUpdate(
        { email },
        { isLocked: true }
      );
    }
    
    failedAttempts.set(key, recentAttempts);
  } else {
    failedAttempts.delete(key);
  }
}
```

### Monitor Unauthorized Access Attempts

```javascript
// Audit log
export async function auditLog(action, user, resource, result, context = {}) {
  await AuditLog.create({
    action,
    userId: user?.id,
    userRole: user?.role,
    resource,
    result,
    timestamp: new Date(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    context
  });
  
  // Alert on suspicious activity
  if (result === 'unauthorized') {
    await sendSlackAlert(
      `Unauthorized access attempt`,
      'warning',
      { user: user?.email, action, resource }
    );
  }
}
```

---

## 🎯 Monitoring Checklist

### Setup Required
- [ ] Sentry error tracking configured
- [ ] Datadog or Cloudwatch metrics enabled
- [ ] Health check endpoint created
- [ ] Uptime monitoring service enabled
- [ ] Slack webhook registered
- [ ] Email alerts configured
- [ ] Structured logging implemented
- [ ] Database monitoring enabled

### Dashboards Created
- [ ] API performance dashboard
- [ ] Error tracking dashboard
- [ ] Business metrics dashboard
- [ ] Infrastructure metrics dashboard
- [ ] Security audit dashboard

### Alerts Configured
- [ ] Critical error alerts
- [ ] High response time alerts
- [ ] Database connection alerts
- [ ] Memory/CPU usage alerts
- [ ] Failed login attempt alerts
- [ ] Service down alerts
- [ ] SSL certificate expiration alerts

### Regular Review
- [ ] Daily: Check error logs
- [ ] Daily: Check uptime status
- [ ] Weekly: Review performance metrics
- [ ] Weekly: Review security logs
- [ ] Monthly: Performance trend analysis
- [ ] Monthly: Alert tuning

---

**Document Status**: ✅ Complete  
**Last Updated**: February 2026  
**Target Audience**: DevOps Engineers, System Administrators, Operations Teams
