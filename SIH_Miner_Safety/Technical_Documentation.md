# 🔧 TECHNICAL DOCUMENTATION
## Intelligent Mobile Safety Companion for Mine Workers

---

## 📋 SYSTEM ARCHITECTURE

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Portal    │    │  Admin Panel   │
│   (React PWA)   │    │   (React SPA)   │    │   (React)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Load Balancer        │
                    │      (Nginx/HAProxy)      │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    API Gateway            │
                    │    (Express.js)           │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│  Auth Service  │    │ Safety Service  │    │  Alert Service  │
│  (JWT/OAuth)   │    │ (Hazard/Gas)    │    │ (Socket.IO)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    Database Layer         │
                    │    (MongoDB Atlas)        │
                    └───────────────────────────┘
```

### **Microservices Architecture**
- **Authentication Service:** User management, JWT tokens, role-based access
- **Safety Service:** Hazard reporting, gas monitoring, checklist management
- **Alert Service:** Real-time notifications, emergency broadcasting
- **Analytics Service:** Data processing, AI predictions, reporting
- **File Service:** Image upload, document management, cloud storage

---

## ⚙️ ENVIRONMENT & DEPLOYMENT READINESS

- **Environment template**: Copy `backend/config/env.sample` to `.env` and populate `PORT`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, plus optional integration keys (Cloudinary, Firebase, Twilio).
- **Frontend config**: Copy `frontend/env.sample` to `frontend/.env` and update `VITE_API_URL` to point at the deployed API gateway.
- **Runtime validation**: `validateEnv()` (loaded in `server.js`) halts boot if any required keys are missing and defaults `PORT` to 5000 when undefined.
- **Global rate limiting**: All `/api/*` routes are guarded by `express-rate-limit` (100 req / 15 min / IP) to mitigate abuse before deployment.
- **Health probe**: `GET /api/health` returns `{ status, uptime, timestamp }` for load balancer checks and uptime monitors.
- **Security headers**: `helmet` and CORS with `CLIENT_URL` restriction remain enabled in all environments.

---

## 🗄️ DATABASE DESIGN

### **Core Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum['worker', 'supervisor', 'admin', 'dgms_officer'],
  preferredLanguage: Enum['english', 'telugu', 'tamil', 'malayalam'],
  profileImage: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Hazards Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  location: {
    type: 'Point',
    coordinates: [Number, Number], // [longitude, latitude]
    description: String
  },
  imageUrl: String,
  reportedBy: ObjectId (ref: User),
  status: Enum['pending', 'in_review', 'resolved'],
  severity: Enum['low', 'medium', 'high', 'critical'],
  category: Enum['electrical', 'mechanical', 'chemical', 'biological', 'physical', 'environmental'],
  assignedTo: ObjectId (ref: User),
  resolution: {
    comment: String,
    actionTaken: String,
    resolvedAt: Date,
    resolvedBy: ObjectId (ref: User)
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### **Gas Monitoring Collection**
```javascript
{
  _id: ObjectId,
  location: {
    type: 'Point',
    coordinates: [Number, Number]
  },
  readings: {
    methane: { value: Number, threshold: Number, safe: Boolean },
    carbonMonoxide: { value: Number, threshold: Number, safe: Boolean },
    hydrogen: { value: Number, threshold: Number, safe: Boolean },
    oxygen: { value: Number, thresholdLow: Number, thresholdHigh: Number, safe: Boolean }
  },
  riskLevel: Enum['low', 'medium', 'high', 'critical'],
  predictions: {
    nextHourRisk: String,
    recommendedActions: [String],
    confidence: Number
  },
  timestamp: Date,
  sensorId: String
}
```

#### **Safety Checklists Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  items: [{
    id: String,
    text: String,
    required: Boolean,
    type: Enum['checkbox', 'text', 'number', 'select']
  }],
  assignedRoles: [String],
  frequency: Enum['daily', 'weekly', 'monthly'],
  isActive: Boolean,
  createdAt: Date
}
```

#### **Checklist Responses Collection**
```javascript
{
  _id: ObjectId,
  checklistId: ObjectId (ref: Checklist),
  userId: ObjectId (ref: User),
  responses: [{
    itemId: String,
    value: Mixed,
    completedAt: Date
  }],
  status: Enum['in_progress', 'completed'],
  completedAt: Date,
  createdAt: Date
}
```

### **Database Indexes**
```javascript
// Performance Optimization Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.hazards.createIndex({ location: "2dsphere" })
db.hazards.createIndex({ status: 1, createdAt: -1 })
db.hazards.createIndex({ reportedBy: 1 })
db.gasmonitoring.createIndex({ location: "2dsphere" })
db.gasmonitoring.createIndex({ timestamp: -1 })
db.checklistresponses.createIndex({ userId: 1, createdAt: -1 })
```

---

## 🔐 SECURITY IMPLEMENTATION

### **Authentication & Authorization**
```javascript
// JWT Token Structure
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    userId: ObjectId,
    email: String,
    role: String,
    permissions: [String],
    iat: Number,
    exp: Number
  }
}

// Role-Based Access Control
const permissions = {
  worker: ['read:hazards', 'create:hazards', 'read:checklists', 'update:checklists'],
  supervisor: ['read:hazards', 'create:hazards', 'update:hazards', 'read:checklists', 'update:checklists', 'read:reports'],
  admin: ['*'], // All permissions
  dgms_officer: ['read:*', 'create:reports', 'update:compliance']
}
```

### **Data Encryption**
- **At Rest:** MongoDB encryption with AES-256
- **In Transit:** TLS 1.3 for all API communications
- **Sensitive Fields:** bcrypt hashing for passwords, JWT for sessions
- **File Storage:** Encrypted cloud storage with Cloudinary

### **API Security**
```javascript
// Rate Limiting Configuration
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts'
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many API requests'
});
```

---

## 📱 MOBILE APPLICATION FEATURES

### **Progressive Web App (PWA)**
```javascript
// Service Worker Configuration
const CACHE_NAME = 'mine-safety-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Offline Functionality
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

### **Mobile-Specific Features**
- **Camera Integration:** Direct photo capture for hazard reporting
- **GPS Location:** Automatic location detection for hazards
- **Push Notifications:** Real-time alerts via Firebase Cloud Messaging
- **Offline Mode:** Cached data and offline form submission
- **Touch Gestures:** Swipe navigation and touch-friendly interfaces

---

## 🤖 AI & MACHINE LEARNING

### **Gas Level Prediction Model**
```python
# Python-based ML Model (TensorFlow/PyTorch)
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

class GasPredictionModel:
    def __init__(self):
        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(60, 4)), # 60 timesteps, 4 gas types
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(4) # Predictions for 4 gas types
        ])
        
    def predict_next_hour(self, gas_history):
        # Predict gas levels for next hour
        prediction = self.model.predict(gas_history)
        return self.interpret_prediction(prediction)
    
    def interpret_prediction(self, prediction):
        risk_levels = []
        for gas_pred in prediction:
            if gas_pred > threshold:
                risk_levels.append('high')
            else:
                risk_levels.append('low')
        return risk_levels
```

### **Hazard Classification AI**
```javascript
// Natural Language Processing for Hazard Description
const classifyHazard = async (description) => {
  const response = await fetch('/api/ai/classify-hazard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  
  const classification = await response.json();
  return {
    category: classification.category,
    severity: classification.severity,
    confidence: classification.confidence
  };
};
```

---

## 📊 REAL-TIME MONITORING

### **Socket.IO Implementation**
```javascript
// Server-side Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join role-based rooms
  socket.on('join-role-room', (role) => {
    socket.join(role);
    console.log(`User ${socket.id} joined room: ${role}`);
  });
  
  // Handle gas level updates
  socket.on('gas-level-update', (data) => {
    // Broadcast to all connected clients
    io.emit('gas-level-changed', data);
    
    // Send alerts if levels are dangerous
    if (data.riskLevel === 'high') {
      io.to('supervisor').emit('emergency-alert', data);
      io.to('admin').emit('emergency-alert', data);
    }
  });
  
  // Handle hazard reports
  socket.on('new-hazard', (hazard) => {
    io.to('supervisor').emit('hazard-reported', hazard);
    io.to('admin').emit('hazard-reported', hazard);
  });
});
```

### **Real-Time Data Processing**
```javascript
// Gas Level Monitoring Service
class GasMonitoringService {
  constructor() {
    this.sensors = new Map();
    this.predictions = new Map();
  }
  
  async processGasReading(sensorData) {
    const { sensorId, readings, timestamp } = sensorData;
    
    // Store current reading
    this.sensors.set(sensorId, {
      ...readings,
      timestamp,
      riskLevel: this.calculateRiskLevel(readings)
    });
    
    // Generate AI prediction
    const prediction = await this.generatePrediction(sensorId);
    this.predictions.set(sensorId, prediction);
    
    // Emit real-time update
    io.emit('gas-update', {
      sensorId,
      readings,
      prediction,
      timestamp
    });
    
    // Trigger alerts if necessary
    if (prediction.riskLevel === 'high') {
      await this.triggerEmergencyAlert(sensorId, readings);
    }
  }
  
  calculateRiskLevel(readings) {
    const unsafeCount = Object.values(readings)
      .filter(gas => !gas.safe).length;
    
    if (unsafeCount >= 2) return 'high';
    if (unsafeCount === 1) return 'medium';
    return 'low';
  }
}
```

---

## 🔄 API ENDPOINTS

### **Authentication Endpoints**
```javascript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/profile
PUT  /api/auth/profile
```

### **Hazard Management Endpoints**
```javascript
GET    /api/hazards                    // Get all hazards
GET    /api/hazards/:id                // Get hazard by ID
POST   /api/hazards                    // Create new hazard
PUT    /api/hazards/:id                // Update hazard
DELETE /api/hazards/:id                // Delete hazard
GET    /api/hazards/severity/:level    // Get hazards by severity
GET    /api/hazards/category/:cat      // Get hazards by category
POST   /api/hazards/:id/resolve        // Resolve hazard
```

### **Gas Monitoring Endpoints**
```javascript
GET  /api/gas/current                 // Get current gas levels
GET  /api/gas/history                 // Get historical data
POST /api/gas/reading                 // Submit gas reading
GET  /api/gas/predictions             // Get AI predictions
GET  /api/gas/alerts                  // Get active alerts
POST /api/gas/emergency               // Trigger emergency alert
```

### **Checklist Endpoints**
```javascript
GET  /api/checklists                  // Get all checklists
GET  /api/checklists/:id             // Get checklist by ID
POST /api/checklists                 // Create checklist
PUT  /api/checklists/:id             // Update checklist
GET  /api/checklists/responses       // Get user responses
POST /api/checklists/responses       // Submit checklist response
```

---

## 📈 PERFORMANCE OPTIMIZATION

### **Frontend Optimization**
```javascript
// Code Splitting and Lazy Loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HazardReporting = lazy(() => import('./pages/HazardReporting'));
const GasDetection = lazy(() => import('./pages/GasDetection'));

// Memoization for Expensive Components
const HazardCard = memo(({ hazard }) => {
  return (
    <div className="hazard-card">
      {/* Component content */}
    </div>
  );
});

// Virtual Scrolling for Large Lists
import { FixedSizeList as List } from 'react-window';

const HazardList = ({ hazards }) => (
  <List
    height={600}
    itemCount={hazards.length}
    itemSize={120}
    itemData={hazards}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <HazardCard hazard={data[index]} />
      </div>
    )}
  </List>
);
```

### **Backend Optimization**
```javascript
// Database Query Optimization
const getHazardsWithPagination = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const hazards = await Hazard.find()
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean() for better performance
    
  return hazards;
};

// Caching Strategy
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

---

## 🧪 TESTING STRATEGY

### **Unit Testing**
```javascript
// Jest Test Examples
describe('Hazard Controller', () => {
  test('should create a new hazard', async () => {
    const mockHazard = {
      title: 'Test Hazard',
      description: 'Test Description',
      location: 'Test Location',
      severity: 'medium',
      category: 'physical'
    };
    
    const result = await createHazard(mockHazard);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe(mockHazard.title);
  });
  
  test('should validate hazard data', () => {
    const invalidHazard = {
      title: '', // Empty title should fail
      description: 'Test Description'
    };
    
    expect(() => validateHazardData(invalidHazard))
      .toThrow('Title is required');
  });
});
```

### **Integration Testing**
```javascript
// API Integration Tests
describe('Hazard API', () => {
  test('POST /api/hazards should create hazard', async () => {
    const response = await request(app)
      .post('/api/hazards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Hazard',
        description: 'Test Description',
        location: 'Test Location',
        severity: 'medium',
        category: 'physical'
      })
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Hazard');
  });
});
```

### **End-to-End Testing**
```javascript
// Cypress E2E Tests
describe('Hazard Reporting Flow', () => {
  it('should complete hazard reporting workflow', () => {
    cy.visit('/hazard-reporting');
    cy.get('[data-testid="hazard-title"]').type('Test Hazard');
    cy.get('[data-testid="hazard-description"]').type('Test Description');
    cy.get('[data-testid="hazard-location"]').type('Test Location');
    cy.get('[data-testid="submit-hazard"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

---

## 🚀 DEPLOYMENT & DEVOPS

### **Docker Configuration**
```dockerfile
# Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```dockerfile
# Dockerfile for Frontend
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/mine-safety
    depends_on:
      - mongo
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### **CI/CD Pipeline**
```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker Images
        run: |
          docker build -t mine-safety-backend ./backend
          docker build -t mine-safety-frontend ./frontend

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Deployment commands
          kubectl apply -f k8s/
```

---

## 📊 MONITORING & ANALYTICS

### **Application Monitoring**
```javascript
// Performance Monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

performanceObserver.observe({ entryTypes: ['navigation'] });

// Error Tracking
window.addEventListener('error', (event) => {
  // Send error to monitoring service
  fetch('/api/analytics/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })
  });
});
```

### **Business Intelligence Dashboard**
```javascript
// Analytics Service
class AnalyticsService {
  async getSafetyMetrics(timeRange) {
    const hazards = await Hazard.find({
      createdAt: { $gte: timeRange.start, $lte: timeRange.end }
    });
    
    const metrics = {
      totalHazards: hazards.length,
      resolvedHazards: hazards.filter(h => h.status === 'resolved').length,
      averageResolutionTime: this.calculateAvgResolutionTime(hazards),
      severityDistribution: this.calculateSeverityDistribution(hazards),
      categoryDistribution: this.calculateCategoryDistribution(hazards)
    };
    
    return metrics;
  }
  
  async getComplianceMetrics(timeRange) {
    const responses = await ChecklistResponse.find({
      createdAt: { $gte: timeRange.start, $lte: timeRange.end }
    });
    
    const metrics = {
      totalChecklists: responses.length,
      completedChecklists: responses.filter(r => r.status === 'completed').length,
      completionRate: this.calculateCompletionRate(responses),
      averageCompletionTime: this.calculateAvgCompletionTime(responses)
    };
    
    return metrics;
  }
}
```

---

## 🔮 FUTURE ENHANCEMENTS

### **Phase 1: Advanced AI Features**
- **Computer Vision:** Automated hazard detection from images
- **Natural Language Processing:** Voice-to-text hazard reporting
- **Predictive Maintenance:** Equipment failure prediction
- **Behavioral Analytics:** Worker safety pattern analysis

### **Phase 2: IoT Integration**
- **Sensor Network:** Integration with existing mine sensors
- **Edge Computing:** Local data processing for reduced latency
- **Device Management:** Centralized IoT device control
- **Data Fusion:** Multi-source data integration

### **Phase 3: Advanced Analytics**
- **Machine Learning Models:** Custom ML models for specific mine conditions
- **Predictive Analytics:** Advanced forecasting algorithms
- **Risk Assessment:** Comprehensive risk scoring system
- **Optimization:** Automated safety protocol optimization

### **Phase 4: Enterprise Features**
- **Multi-Site Management:** Centralized management for multiple locations
- **Advanced Reporting:** Customizable reports and dashboards
- **Integration APIs:** Third-party system integration
- **Compliance Automation:** Automated regulatory reporting

---

## 📋 CONCLUSION

This technical documentation provides a comprehensive overview of the **Intelligent Mobile Safety Companion for Mine Workers** system. The architecture is designed for scalability, maintainability, and performance, with modern technologies and best practices throughout.

### **Key Technical Achievements:**
- **Scalable Architecture:** Microservices-based design supporting thousands of concurrent users
- **Real-Time Capabilities:** Socket.IO implementation for instant communication
- **AI Integration:** Machine learning models for predictive safety analytics
- **Mobile-First Design:** Progressive Web App with offline capabilities
- **Security-First Approach:** Comprehensive security measures and data protection
- **Performance Optimization:** Caching, lazy loading, and efficient database queries

### **Innovation Highlights:**
- **Industry-First Features:** AI-powered gas prediction and hazard classification
- **Modern Tech Stack:** Latest web technologies and frameworks
- **Comprehensive Testing:** Unit, integration, and E2E testing strategies
- **DevOps Ready:** Docker containerization and CI/CD pipeline
- **Monitoring & Analytics:** Comprehensive performance and business metrics

This system represents a significant advancement in mine safety technology, combining cutting-edge software engineering with practical safety applications to create a truly intelligent safety companion for mine workers.
