# IP-Fi Backend Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual configuration
# At minimum, update:
# - MONGODB_URI
# - JWT_SECRET
# - CLOUDINARY credentials (for file uploads)
# - SMTP credentials (for emails)
```

### 3. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

This creates sample data including:
- Admin user: admin@ipfi.com / Admin123!@
- Creator user: creator@ipfi.com / Creator123!@  
- Investor user: investor@ipfi.com / Investor123!@
- Sample IP assets (digital art, patents, music)
- Sample investments and transactions

## API Testing

The server runs on `http://localhost:5000` by default.

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Test Authentication:**
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-super-secure-jwt-secret-64-characters-minimum
FRONTEND_URL=https://yourdomain.com
```

### PM2 Deployment (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "ip-fi-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Docker Deployment
```bash
# Build Docker image
docker build -t ip-fi-backend .

# Run container
docker run -d \
  --name ip-fi-backend \
  -p 5000:5000 \
  --env-file .env \
  ip-fi-backend
```

## Required Services

### MongoDB
- Local: Install MongoDB Community Server
- Cloud: MongoDB Atlas (recommended for production)
- Connection string format: `mongodb://localhost:27017/ipfi-platform`

### Redis (Optional but Recommended)
- Used for session storage and caching
- Local: Install Redis server
- Cloud: Redis Cloud, AWS ElastiCache, etc.

### Cloudinary (File Storage)
1. Create account at cloudinary.com
2. Get your cloud name, API key, and API secret
3. Add to .env file

### Email Service (SMTP)
- Gmail: Use app-specific password
- SendGrid, Mailgun, or other SMTP providers
- Required for user registration confirmations

## Monitoring & Logs

### View Logs
```bash
# Development logs (console)
npm run dev

# Production logs with PM2
pm2 logs ip-fi-backend

# Log files location
./logs/
├── error.log
├── combined.log
└── access.log
```

### Health Monitoring
- Health endpoint: `/health`
- Returns server status, uptime, and basic metrics
- Use for load balancer health checks

## Security Checklist

- [ ] Update JWT_SECRET to a secure 64+ character string
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (already included)
- [ ] Keep dependencies updated
- [ ] Monitor logs for security issues
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process or change PORT in .env
```

**MongoDB Connection Issues:**
```bash
# Check MongoDB is running
mongosh
# Or check connection string in .env
```

**Module Not Found Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev

# Check environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env)"
```

## API Documentation

Once running, the following endpoints are available:

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login  
- POST `/api/auth/connect-wallet` - Connect Web3 wallet
- GET `/api/auth/me` - Get current user profile

### Assets
- GET `/api/assets` - List all assets (with filtering)
- POST `/api/assets` - Create new IP asset
- GET `/api/assets/:id` - Get single asset details
- PUT `/api/assets/:id` - Update asset

### Investments  
- POST `/api/investments` - Create new investment
- GET `/api/investments` - Get user investments
- GET `/api/investments/:id` - Get investment details

### Transactions
- GET `/api/transactions` - Get transaction history
- GET `/api/transactions/stats` - Get transaction statistics

### Analytics
- GET `/api/analytics/overview` - Platform overview
- GET `/api/analytics/dashboard` - User dashboard data

### Blockchain
- GET `/api/blockchain/gas-price` - Current gas prices
- POST `/api/blockchain/verify-signature` - Verify wallet signature

## Performance Tips

1. **Database Indexing**: Indexes are already configured in models
2. **Caching**: Redis integration ready for caching
3. **Compression**: Gzip compression enabled
4. **Rate Limiting**: Configured to prevent abuse
5. **Connection Pooling**: Mongoose handles MongoDB connections
6. **Memory Management**: Process monitoring with PM2

## Support

- Check logs in `./logs/` directory
- Review console output for errors
- Verify environment variables are set
- Test database connectivity
- Check network/firewall settings

The backend is now fully functional and ready for production use!