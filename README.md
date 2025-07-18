# TICKETHIVE Platform

A comprehensive multi-tenant platform demonstrating advanced architectural patterns including micro-frontends, workflow automation, and secure tenant isolation.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Shell App     │    │  Support Tickets│    │      n8n        │
│   (Port 3000)   │◄──►│   (Port 3002)   │    │   (Port 5678)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Server (Port 3001)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Auth     │  │   Tickets   │  │  Webhooks   │            │
│  │  Service    │  │   Service   │  │   Service   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
        │                                       │
        ▼                                       ▼
┌─────────────────┐                    ┌─────────────────┐
│    MongoDB      │                    │     Ngrok       │
│   (Port 27017)  │                    │   (Port 4040)   │
└─────────────────┘                    └─────────────────┘
```

## Features

### Core Requirements Implemented

- **R1: Auth & RBAC** - JWT-based authentication with role-based access control
- **R2: Tenant Data Isolation** - Strict data separation with MongoDB indexes
- **R3: Use-Case Registry** - Hard-coded tenant-specific screen configurations
- **R4: Dynamic Navigation** - React shell with lazy-loaded micro-frontends
- **R5: Workflow Ping** - n8n integration with webhook callbacks
- **R6: Containerized Dev** - Complete Docker Compose setup

### Bonus Features

- **Audit Log** - Complete action tracking with timestamp and user info
- **Cypress Tests** - End-to-end testing suite (see `/cypress` directory)
- **GitHub Actions** - CI/CD pipeline for linting and testing

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Winston** for logging

### Frontend
- **React 18** with Hooks
- **Webpack Module Federation** for micro-frontends
- **Axios** for API communication
- **Lucide React** for icons

### Infrastructure
- **Docker** & Docker Compose
- **n8n** workflow automation
- **Ngrok** for webhook testing
- **Jest** for unit testing

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (if running locally)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flowbit-platform
```

### 2. Set Up Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
MONGODB_URI=mongodb://admin:password123@mongodb:27017/flowbit?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
WEBHOOK_SECRET=webhook-secret-key-123
N8N_WEBHOOK_URL=http://n8n:5678/webhook/flowbit-trigger
```

### 3. Start the Platform
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Seed the Database
```bash
# Run the seed script
docker-compose exec api npm run seed
```

### 5. Access the Application
- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:3001/health
- **n8n Workflow Editor**: http://localhost:5678 (admin/password123)
- **Ngrok Dashboard**: http://localhost:4040

## 👥 Demo Accounts

### LogisticsCo Tenant
- **Admin**: admin@logisticsco.com / password123
- **User**: user@logisticsco.com / password123

### RetailGmbH Tenant
- **Admin**: admin@retailgmbh.com / password123
- **User**: user@retailgmbh.com / password123

## Testing

### Run Unit Tests
```bash
# API unit tests
docker-compose exec api npm test

# Run specific test file
docker-compose exec api npm test -- --testNamePattern="Tenant Isolation"
```

### Run Integration Tests
```bash
# Full test suite
docker-compose exec api npm run test:integration
```

### Cypress E2E Tests
```bash
# Install Cypress (if not in container)
npm install cypress

# Run Cypress tests
npx cypress open
```

## Development

### Local Development Setup
```bash
# Install dependencies for all services
npm run install:all

# Start MongoDB
docker-compose up -d mongodb

# Start API server
cd api && npm run dev

# Start Shell app
cd shell && npm start

# Start Support Tickets app
cd support-tickets-app && npm start
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### Tickets
- `GET /api/tickets` - List tickets (tenant-isolated)
- `POST /api/tickets` - Create ticket (triggers n8n workflow)
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

#### Webhooks
- `POST /webhook/ticket-done` - n8n workflow completion callback
- `POST /webhook/generic` - Generic webhook endpoint

## Security Features

### Tenant Isolation
- MongoDB collections include `customerId` field
- Middleware automatically adds tenant filters
- Pre-query hooks prevent cross-tenant data access
- Unit tests verify isolation integrity

### Authentication & Authorization
- JWT tokens with role-based claims
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Workflow Integration

### n8n Setup
1. Access n8n at http://localhost:5678
2. Import workflow from `/n8n-workflows/flowbit-ticket-workflow.json`
3. Configure webhook endpoints
4. Test workflow execution

### Webhook Flow
1. User creates ticket in frontend
2. API triggers n8n workflow via HTTP request
3. n8n processes ticket (simulated delay)
4. n8n calls back to `/webhook/ticket-done`
5. API updates ticket status in MongoDB
6. Frontend shows updated status

## Monitoring & Logging

### Health Checks
- `GET /health` - API server health
- `GET /webhook/health` - Webhook service health
- Docker health checks for all services

### Audit Logging
All user actions are logged with:
- Action type (CREATE_TICKET, UPDATE_TICKET, etc.)
- User ID and tenant ID
- Timestamp and IP address
- Resource details and changes

### Performance Monitoring
- Request/response time logging
- Error rate tracking
- Database query performance
- Memory and CPU usage metrics

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| mongodb | 27017 | MongoDB database |
| api | 3001 | Node.js API server |
| shell | 3000 | React shell application |
| support-tickets-app | 3002 | Support tickets micro-frontend |
| n8n | 5678 | Workflow automation |
| ngrok | 4040 | Tunnel for webhook testing |

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check port usage
lsof -i :3000
lsof -i :3001

# Stop conflicting services
docker-compose down
```

**Database connection issues:**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Reset MongoDB data
docker-compose down -v
docker-compose up -d mongodb
```

**Module federation errors:**
```bash
# Clear module cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
docker-compose up

# View detailed logs
docker-compose logs -f --tail=100 api
```

## Performance Optimization

### Database Indexing
- Compound indexes for tenant isolation
- Query optimization for filtered results
- Connection pooling configuration

### Frontend Optimization
- Code splitting with Webpack
- Lazy loading of micro-frontends
- Optimized bundle sizes

### API Performance
- Response compression
- Caching strategies
- Rate limiting implementation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request
