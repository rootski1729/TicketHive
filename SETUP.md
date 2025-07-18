# Flowbit Platform Setup Guide

This guide will help you set up the Flowbit multi-tenant platform from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18.0+) and **npm** (v9.0+)
- **Git** (v2.30+)
- **curl** or **wget** for testing
- **ngrok** account (optional, for webhook testing)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Linux, macOS, or Windows with WSL2

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flowbit-platform
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (optional for quick start)
# Default values work for local development
```

### 3. Start the Platform

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (about 1-2 minutes)
docker-compose logs -f api
```

### 4. Seed Database

```bash
# Seed with demo data
docker-compose exec api npm run seed
```

### 5. Access the Application

- **Web Application**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health
- **n8n Workflow Editor**: http://localhost:5678

### 6. Login with Demo Accounts

Use these credentials to test different tenants:

**LogisticsCo:**
- Admin: `admin@logisticsco.com` / `password123`
- User: `user@logisticsco.com` / `password123`

**RetailGmbH:**
- Admin: `admin@retailgmbh.com` / `password123`
- User: `user@retailgmbh.com` / `password123`

## 🔧 Detailed Setup

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/flowbit?authSource=admin

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
WEBHOOK_SECRET=webhook-secret-key-123

# Services
N8N_WEBHOOK_URL=http://n8n:5678/webhook/flowbit-trigger
REACT_APP_API_URL=http://localhost:3001/api

# Optional: Ngrok for webhook testing
NGROK_AUTHTOKEN=your-ngrok-token-here
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Services                      │
├─────────────────────────────────────────────────────────────────┤
│  mongodb:27017     │  API Server (Node.js)                     │
│  api:3001          │  Shell App (React)                        │
│  shell:3000        │  Support Tickets (React)                  │
│  tickets:3002      │  n8n Workflow Engine                      │
│  n8n:5678          │  Ngrok Tunnels                           │
│  ngrok:4040        │                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Manual Setup (Development)

If you prefer to run services individually:

```bash
# 1. Start MongoDB
docker-compose up -d mongodb

# 2. Install dependencies
npm run install:all

# 3. Start API server
cd api
npm run dev

# 4. Start Shell app (new terminal)
cd shell
npm start

# 5. Start Support Tickets app (new terminal)
cd support-tickets-app
npm start

# 6. Start n8n (new terminal)
docker-compose up -d n8n
```

## 🧪 Testing Setup

### Unit Tests

```bash
# Run API tests
docker-compose exec api npm test

# Run with coverage
docker-compose exec api npm run test:coverage

# Watch mode
docker-compose exec api npm run test:watch
```

### Integration Tests

```bash
# Run full test suite
docker-compose exec api npm run test:integration

# Test specific feature
docker-compose exec api npm test -- --testNamePattern="Tenant Isolation"
```

### E2E Tests (Cypress)

```bash
# Install Cypress
npm install -D cypress

# Run Cypress tests
npx cypress run

# Open Cypress UI
npx cypress open
```

## 🔍 n8n Workflow Setup

### 1. Access n8n

1. Go to http://localhost:5678
2. Login with `admin` / `password123`
3. Create a new workflow

### 2. Import Workflow

1. Copy the workflow JSON from `n8n-workflows/flowbit-ticket-workflow.json`
2. In n8n, go to **Workflows** → **Import from JSON**
3. Paste the JSON and save

### 3. Configure Webhook

1. The webhook endpoint should be: `http://n8n:5678/webhook/flowbit-trigger`
2. Make sure the webhook is active
3. Test the webhook by creating a ticket

### 4. Verify Workflow

1. Create a ticket in the application
2. Check n8n executions to see the workflow run
3. Verify the ticket status updates in the application

## 🌐 Webhook Testing with Ngrok

### 1. Set up Ngrok

```bash
# Sign up at https://ngrok.com
# Get your authtoken from the dashboard
# Add to .env file
NGROK_AUTHTOKEN=your-token-here
```

### 2. Start Ngrok

```bash
# Restart services to pick up ngrok token
docker-compose down
docker-compose up -d

# Check ngrok dashboard
open http://localhost:4040
```

### 3. Update Webhook URLs

Update your n8n workflow to use the public ngrok URL for callbacks.

## 📊 Monitoring & Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f shell
docker-compose logs -f n8n

# Last 100 lines
docker-compose logs --tail=100 api
```

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# All services
npm run health

# Database connection
docker-compose exec mongodb mongosh -u admin -p password123
```

### Performance Monitoring

```bash
# Container stats
docker stats

# Service status
docker-compose ps

# Resource usage
docker system df
```

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Stop services
docker-compose down
```

**Database issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d mongodb
docker-compose exec api npm run seed
```

**Module federation errors:**
```bash
# Clear cache and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**n8n workflow not triggering:**
```bash
# Check n8n logs
docker-compose logs n8n

# Verify webhook URL
curl -X POST http://localhost:5678/webhook/flowbit-trigger \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=*
docker-compose up

# API debug mode
docker-compose exec api npm run dev:debug
```

### Reset Everything

```bash
# Complete reset
docker-compose down -v --remove-orphans
docker system prune -a
docker-compose up -d
docker-compose exec api npm run seed
```

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:

```bash
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-make-it-very-long
WEBHOOK_SECRET=your-production-webhook-secret
MONGODB_URI=mongodb://user:pass@production-mongo:27017/flowbit
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

### Scaling Considerations

- Use MongoDB replica sets
- Implement Redis for session storage
- Set up load balancers
- Configure auto-scaling
- Monitor resource usage

## 📝 Configuration Reference

### API Configuration

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flowbit
MONGODB_POOL_SIZE=10

# Security
JWT_SECRET=your-jwt-secret
WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Features
AUDIT_LOGGING_ENABLED=true
RATE_LIMITING_ENABLED=true
```

### Frontend Configuration

```bash
# React Apps
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SHELL_URL=http://localhost:3000
REACT_APP_TICKETS_URL=http://localhost:3002

# Build
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
```

### n8n Configuration

```bash
# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password123

# Networking
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://n8n:5678/
```

## 🤝 Development Workflow

### 1. Making Changes

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes to code
# Test changes
npm run test

# Commit changes
git commit -m "Add new feature"
```

### 2. Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run cypress:run

# Check linting
npm run lint
```

### 3. Building

```bash
# Build all services
docker-compose build

# Test build
docker-compose up -d
npm run health
```

### 4. Deployment

```bash
# Deploy to staging
git push origin feature/new-feature

# After review, merge to main
git checkout main
git merge feature/new-feature

# Deploy to production
git tag v1.0.0
git push origin v1.0.0
```

## 📚 Additional Resources

- [API Documentation](API.md)
- [Frontend Architecture](FRONTEND.md)
- [Database Schema](DATABASE.md)
- [Security Guide](SECURITY.md)
- [Performance Optimization](PERFORMANCE.md)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs -f`
3. Create an issue in the repository
4. Contact the development team

## 🎯 Next Steps

After setup, consider:

1. **Customize tenant configurations** in `api/config/registry.json`
2. **Add custom workflows** in n8n
3. **Implement additional micro-frontends**
4. **Set up monitoring and alerting**
5. **Configure backup strategies**

---

*Happy coding! 🚀*