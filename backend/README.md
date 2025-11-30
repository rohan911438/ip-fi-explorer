# IP-Fi Backend API

A comprehensive backend API for the IP-Fi fractional IP ownership platform built with Node.js, Express, MongoDB, and blockchain integration.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Wallet Integration** - MetaMask and Web3 wallet connection
- **Asset Management** - Create, manage, and invest in IP assets
- **Investment Processing** - Handle fractional ownership investments
- **Royalty Distribution** - Automated royalty payments to investors
- **Real-time Updates** - WebSocket support for live data
- **Blockchain Integration** - Story Protocol smart contract interaction

### Asset Types Supported
- Digital Art & NFTs
- Patents & Intellectual Property
- Music Rights & Royalties
- Character IP & Trademarks
- Copyright & Trade Secrets

### Advanced Features
- **Real-time Analytics Dashboard**
- **Automated Email Notifications**
- **File Upload & Cloud Storage**
- **Payment Processing Integration**
- **Advanced Search & Filtering**
- **Performance Metrics & ROI Tracking**
- **Admin Panel & Management Tools**

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Redis (for session management)
- Cloudinary account (for file storage)
- Story Protocol access (for blockchain features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ip-fi-explorer/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Make sure MongoDB is running
   npm run seed  # Optional: populate with sample data
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ipfi-platform

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-project-id
STORY_PROTOCOL_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your-private-key-for-contract-interactions

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - User login
POST /api/auth/connect-wallet    - Connect Web3 wallet
GET  /api/auth/me               - Get current user
POST /api/auth/logout           - User logout
```

### Asset Endpoints
```
GET    /api/assets              - List all assets (with filtering)
GET    /api/assets/:id          - Get single asset
POST   /api/assets              - Create new asset
PUT    /api/assets/:id          - Update asset
DELETE /api/assets/:id          - Delete asset
GET    /api/assets/user/created - Get user's created assets
```

### Investment Endpoints
```
POST /api/investments           - Create investment
GET  /api/investments           - Get user investments
GET  /api/investments/:id       - Get single investment
PUT  /api/investments/:id/value - Update investment value
```

### Transaction Endpoints
```
GET /api/transactions           - Get user transactions
GET /api/transactions/:id       - Get single transaction
GET /api/transactions/stats     - Get transaction statistics
```

### Royalty Endpoints
```
POST /api/royalties/distribute/:assetId - Distribute royalties
GET  /api/royalties/payments            - Get royalty payments
GET  /api/royalties/stats               - Get royalty statistics
```

### Analytics Endpoints
```
GET /api/analytics/overview     - Platform overview
GET /api/analytics/trends       - Market trends
GET /api/analytics/dashboard    - User dashboard
GET /api/analytics/admin        - Admin analytics
```

### Blockchain Endpoints
```
GET  /api/blockchain/gas-price       - Current gas prices
POST /api/blockchain/verify-signature - Verify wallet signature
GET  /api/blockchain/token-balance/:id - Get token balance
GET  /api/blockchain/eth-price       - ETH to USD price
```

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── notFound.js          # 404 handler
│   └── validation.js        # Input validation
├── models/
│   ├── User.js              # User model
│   ├── Asset.js             # Asset model
│   ├── Investment.js        # Investment model
│   └── Transaction.js       # Transaction model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── assets.js            # Asset routes
│   ├── investments.js       # Investment routes
│   ├── transactions.js      # Transaction routes
│   ├── royalties.js         # Royalty routes
│   ├── analytics.js         # Analytics routes
│   ├── blockchain.js        # Blockchain routes
│   └── notifications.js     # Notification routes
├── services/
│   └── blockchain.js        # Blockchain integration
├── utils/
│   ├── logger.js            # Logging utility
│   ├── response.js          # API response helpers
│   ├── email.js             # Email service
│   └── upload.js            # File upload utility
├── scripts/
│   └── seedDatabase.js      # Database seeding
├── logs/                    # Log files
├── server.js                # Main server file
└── package.json
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **MongoDB Sanitization** to prevent injection
- **File Upload Validation** with type and size limits
- **Wallet Signature Verification** for blockchain operations

## 📊 Database Models

### User Model
- Authentication & profile information
- Wallet integration
- Investment tracking
- Role-based permissions

### Asset Model
- IP asset details & metadata
- Ownership structure
- Financial information
- Blockchain integration

### Investment Model
- User investment records
- Share ownership tracking
- ROI calculations
- Performance metrics

### Transaction Model
- Complete transaction history
- Payment processing details
- Blockchain transaction data
- Fee calculations

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker (Optional)
```bash
docker build -t ip-fi-backend .
docker run -p 5000:5000 ip-fi-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Detailed error information
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Real-time Features

The backend includes WebSocket support for real-time updates:
- Investment notifications
- Royalty payment alerts
- Asset status changes
- Market data updates

## 📈 Monitoring & Logging

- **Winston** for structured logging
- **Morgan** for HTTP request logging
- **Health check** endpoint at `/health`
- Performance monitoring capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@ipfi.com
- Documentation: [API Docs](https://docs.ipfi.com)
- Issues: [GitHub Issues](https://github.com/your-org/ip-fi-explorer/issues)

## 🏆 Features Roadmap

- [ ] Multi-chain blockchain support
- [ ] Advanced analytics dashboard
- [ ] Mobile app API support
- [ ] Third-party integrations
- [ ] Advanced security features
- [ ] Performance optimizations