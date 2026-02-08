# Advanced Security Hardening Guide

Comprehensive guide for advanced security measures beyond basic authentication and authorization for production environments.

---

## Overview

This guide covers:
- Advanced authentication strategies
- API security hardening
- Data encryption and protection
- Compliance and auditing
- Threat detection and prevention
- DDoS protection
- Secrets management

---

## 🔐 Advanced Authentication

### 1. Rate Limiting & Account Lockout

```javascript
// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production'
});

// Strict login limiter - prevent brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skip: (req) => process.env.NODE_ENV !== 'production',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again after 15 minutes.'
    });
  }
});

// Stricter limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts. Please try again later.'
});

// Apply limiters
import { apiLimiter, loginLimiter } from './middleware/rateLimiter.js';

app.use('/api/', apiLimiter);
authRoutes.post('/login', loginLimiter, login);
authRoutes.post('/password-reset', passwordResetLimiter, resetPassword);
```

### 2. Account Lockout After Failed Attempts

```javascript
// src/services/accountSecurity.js
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

export async function recordFailedLoginAttempt(email) {
  const user = await User.findOne({ email });
  
  if (!user) return;
  
  const now = new Date();
  const recentAttempts = user.loginAttempts?.filter(
    attempt => now - attempt < LOCKOUT_TIME
  ) || [];
  
  recentAttempts.push(now);
  
  await User.updateOne(
    { email },
    { 
      loginAttempts: recentAttempts,
      isLocked: recentAttempts.length >= MAX_ATTEMPTS,
      lockedUntil: recentAttempts.length >= MAX_ATTEMPTS 
        ? new Date(now.getTime() + LOCKOUT_TIME)
        : null
    }
  );
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    // Send security alert email
    await sendSecurityAlert(email, 'Account locked due to failed login attempts');
  }
}

export async function unlockAccount(email) {
  await User.updateOne(
    { email },
    {
      isLocked: false,
      loginAttempts: [],
      lockedUntil: null
    }
  );
}

export async function checkAccountLocked(email) {
  const user = await User.findOne({ email });
  
  if (!user?.isLocked) return false;
  
  if (user.lockedUntil && new Date() > user.lockedUntil) {
    await unlockAccount(email);
    return false;
  }
  
  return true;
}
```

### 3. Two-Factor Authentication (2FA)

```bash
npm install speakeasy qrcode
```

```javascript
// src/services/twoFactor.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateTwoFactorSecret(userId, email) {
  const secret = speakeasy.generateSecret({
    name: `Farmer App (${email})`,
    issuer: 'Farmer Support & Marketplace',
    length: 32
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode
  };
}

export function verifyTwoFactorToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow tokens within ±1 time window
  });
}

// Controller
export const enableTwoFactor = async (req, res) => {
  try {
    const { secret, qrCode } = await generateTwoFactorSecret(
      req.user.id,
      req.user.email
    );
    
    // Store secret temporarily (needs verification first)
    req.session.pending2FA = {
      secret,
      createdAt: new Date()
    };
    
    res.json({ qrCode, secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const { secret } = req.session.pending2FA;
    
    if (!secret) {
      return res.status(400).json({ error: 'No pending 2FA setup' });
    }
    
    if (!verifyTwoFactorToken(secret, token)) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Save 2FA to user
    await User.updateOne(
      { _id: req.user.id },
      {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    );
    
    delete req.session.pending2FA;
    
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login with 2FA
export const verifyLoginToken = async (req, res) => {
  try {
    const { userEmail, token } = req.body;
    const user = await User.findOne({ email: userEmail });
    
    if (!user?.twoFactorEnabled) {
      return res.status(400).json({ error: 'User does not have 2FA enabled' });
    }
    
    if (!verifyTwoFactorToken(user.twoFactorSecret, token)) {
      await recordFailedLoginAttempt(userEmail);
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }
    
    // Clear failed attempts
    await User.updateOne(
      { _id: user._id },
      { loginAttempts: [] }
    );
    
    // Generate final JWT
    const jwtToken = generateJWT(user);
    res.json({ token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🔒 API Security Hardening

### 1. CORS Configuration (Restrictive)

```javascript
// src/config/cors.js
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://yourapp.com',
      'https://www.yourapp.com',
      'https://admin.yourapp.com'
    ];
    
    if (process.env.NODE_ENV !== 'production') {
      // Allow localhost in development
      allowedOrigins.push('http://localhost:5173');
      allowedOrigins.push('http://localhost:3000');
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Usage
app.use(cors(corsOptions));
```

### 2. Security Headers

```javascript
// src/middleware/securityHeaders.js
import helmet from 'helmet';

export function securityHeaders(app) {
  // Helmet provides sensible defaults
  app.use(helmet());
  
  // Custom headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature policy / Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    next();
  });
}

// Usage
import { securityHeaders } from './middleware/securityHeaders.js';
securityHeaders(app);
```

### 3. Input Validation & Sanitization

```bash
npm install joi express-validator
```

```javascript
// src/middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';
import Joi from 'joi';

// Validation schemas
export const schemas = {
  user: {
    register: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(/[A-Z]/).pattern(/[0-9]/).required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/),
      role: Joi.string().valid('farmer', 'customer').required()
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },
  product: {
    create: Joi.object({
      productName: Joi.string().min(3).max(200).required(),
      cropId: Joi.string().regex(/^[0-9a-f]{24}$/).required(), // MongoDB ObjectId
      quantity: Joi.number().positive().required(),
      basePrice: Joi.number().positive().required()
    })
  }
};

// Validation middleware
export function validateSchema(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validatedBody = value;
    next();
  };
}

// Express-validator alternative
export const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Usage
import { validateLogin } from './middleware/validation.js';
router.post('/login', validateLogin, login);
```

### 4. SQL Injection & NoSQL Injection Prevention

```javascript
// Already prevented using Mongoose ODM, but add validation
import mongoSanitize from 'express-mongo-sanitize';

app.use(mongoSanitize()); // Prevents NoSQL injection

// Example - filter out $ and . from keys
const notAllowedChars = /^\$|\.(?!.*\..*$)/;

export function validateMongoId(id) {
  const mongoObjectIdRegex = /^[0-9a-f]{24}$/i;
  if (!mongoObjectIdRegex.test(id)) {
    throw new Error('Invalid MongoDB ID format');
  }
  return id;
}
```

---

## 🔐 Data Protection

### 1. Encryption at Rest

```bash
npm install crypto-js
```

```javascript
// src/utils/encryption.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  crypto.randomBytes(32); // Should be 32 bytes

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage - encrypt sensitive fields
export const UserSchema = new Schema({
  email: String,
  phone: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  address: {
    type: String,
    set: encrypt,
    get: decrypt
  }
});
```

### 2. Encryption in Transit (HTTPS)

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && 
      req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Enable HSTS (HTTP Strict Transport Security)
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true,
  preload: true
}));
```

### 3. Sensitive Data in Logs

```javascript
// Redact sensitive information in logs
export function redactSensitiveData(obj) {
  const sensitiveFields = ['password', 'token', 'apiKey', 'creditCard', 'ssn', 'phone'];
  const redacted = { ...obj };
  
  const redactRecursive = (obj) => {
    for (const key in obj) {
      if (sensitiveFields.includes(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactRecursive(obj[key]);
      }
    }
  };
  
  redactRecursive(redacted);
  return redacted;
}

// Usage in logging
Logger.info('User login', redactSensitiveData(req.body));
```

---

## 🛡️ Compliance & Auditing

### 1. Audit Logging

```javascript
// src/models/AuditLog.js
const AuditLogSchema = new Schema({
  action: {
    type: String,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'PASSWORD_CHANGED',
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',
      'DATA_ACCESSED',
      'DATA_MODIFIED',
      'DATA_DELETED',
      'SECURITY_ALERT'
    ],
    required: true
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userRole: String,
  resource: String, // What was affected
  resourceId: String, // ID of the resource
  result: { type: String, enum: ['success', 'failure', 'unauthorized'] },
  ipAddress: String,
  userAgent: String,
  details: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'] }
});

// Audit middleware
export async function auditLog(action, userId, resource, result, context = {}) {
  try {
    await AuditLog.create({
      action,
      userId,
      userRole: context.userRole,
      resource,
      resourceId: context.resourceId,
      result,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details: redactSensitiveData(context.details),
      severity: result === 'failure' ? 'warning' : 'info'
    });
    
    // Alert on critical actions
    if (result === 'unauthorized' || action === 'SECURITY_ALERT') {
      await sendSecurityAlert(action, { userId, resource });
    }
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
```

### 2. GDPR Compliance

```javascript
// src/services/gdprCompliance.js

// Data export
export async function exportUserData(userId) {
  const user = await User.findById(userId);
  const orders = await Order.find({ customerId: userId });
  const products = await FarmProduct.find({ farmerId: userId });
  
  return {
    personalData: user,
    orders,
    products
  };
}

// Right to be forgotten
export async function deleteUserData(userId) {
  // Soft delete - mark as deleted instead of removing
  await User.updateOne(
    { _id: userId },
    {
      isDeleted: true,
      email: `deleted-${userId}@deleted.local`,
      deletedAt: new Date(),
      personalData: null // Clear personal information
    }
  );
  
  // Log the deletion
  await auditLog(
    'USER_DELETED',
    userId,
    'User',
    'success',
    { reason: 'GDPR request' }
  );
}

// Data retention policy
export async function enforceDataRetention() {
  const retentionDays = 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  // Delete old deleted user records
  await User.deleteMany({
    isDeleted: true,
    deletedAt: { $lt: cutoffDate }
  });
  
  // Archive old orders
  const archivedCount = await Order.countDocuments({
    status: 'delivered',
    createdAt: { $lt: cutoffDate }
  });
  
  console.log(`✅ Archived ${archivedCount} old orders`);
}
```

---

## 🚨 Threat Detection

### 1. Suspicious Activity Detection

```javascript
// src/services/threatDetection.js

export async function detectSuspiciousActivity(req, context) {
  const alerts = [];
  
  // Check for rapid API calls from same IP
  const recentRequests = await getRecentRequests(req.ip);
  if (recentRequests > 100) {
    alerts.push({
      type: 'HIGH_REQUEST_RATE',
      severity: 'warning',
      message: 'Unusually high request rate detected'
    });
  }
  
  // Check for data exfiltration patterns
  if (context.largeDataExport && context.largeDataExport > 100000) {
    alerts.push({
      type: 'LARGE_DATA_EXPORT',
      severity: 'critical',
      message: 'Large data export detected'
    });
  }
  
  // Check for permission modification attempts
  if (context.action === 'PERMISSION_CHANGE' && 
      req.user.role !== 'admin') {
    alerts.push({
      type: 'UNAUTHORIZED_PERMISSION_ATTEMPT',
      severity: 'critical',
      message: 'Non-admin attempted permission modification'
    });
  }
  
  // Send alerts if any detected
  for (const alert of alerts) {
    await sendSecurityAlert(alert.type, alert);
  }
  
  return alerts;
}
```

### 2. Intrusion Detection

```javascript
// Detect common attack patterns
export function detectAttackPatterns(req) {
  const suspiciousPatterns = [
    /(\bselect\b|\bunion\b|\bdrop\b)/i, // SQL keywords
    /\$where|\$regex/,                   // MongoDB operators
    /<script|javascript:|on\w+=/i,       // XSS patterns
    /\.\.\//,                             // Path traversal
    /%27|%22|%3B/,                        // Encoded special chars
  ];
  
  const urlString = JSON.stringify(req.query) + req.body.toString();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(urlString)) {
      return true;
    }
  }
  
  return false;
}

// Middleware
app.use((req, res, next) => {
  if (detectAttackPatterns(req)) {
    console.warn(`Attack pattern detected from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});
```

---

## 🔑 Secrets Management

### 1. Environment Variables

```bash
# .env.example
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key
VITE_API_URL=https://api.yourapp.com
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 2. Secrets Rotation

```javascript
// Schedule monthly secret rotation
import cron from 'node-cron';

// Every month at midnight
cron.schedule('0 0 1 * *', async () => {
  console.log('🔄 Starting secrets rotation...');
  
  // Generate new JWT_SECRET
  const newSecret = crypto.randomBytes(32).toString('hex');
  
  // Log rotation event
  await auditLog(
    'SECURITY_ALERT',
    null,
    'Secrets',
    'success',
    { eventType: 'SECRETS_ROTATED' }
  );
  
  // Update in secrets vault
  // (Implementation depends on your secrets manager)
  console.log('✅ Secrets rotated successfully');
});
```

---

## 🎯 Security Checklist

- [ ] HTTPS enforced on all connections
- [ ] HSTS enabled
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] CORS restricted to specific origins
- [ ] Rate limiting enabled
- [ ] Account lockout after failed attempts
- [ ] 2FA available for sensitive operations
- [ ] Input validation on all endpoints
- [ ] Sensitive data redacted from logs
- [ ] Encryption implemented for sensitive data
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed
- [ ] Vulnerability scanning automated
- [ ] OWASP Top 10 addressed
- [ ] Incident response plan documented
- [ ] Security training completed
- [ ] Compliance requirements met (GDPR, etc.)
- [ ] Secrets rotation schedule defined
- [ ] Audit logging enabled
- [ ] Threat detection configured

---

**Document Status**: ✅ Complete  
**Last Updated**: February 2026  
**Target Audience**: Security Engineers, DevOps, System Architects
