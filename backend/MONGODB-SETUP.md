# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Sign up for free**: https://cloud.mongodb.com/
2. **Create a new cluster** (select the free M0 tier)
3. **Create a database user**:
   - Username: `ipfi-user`
   - Password: Generate a secure password
4. **Add your IP address** to the network access list (or use 0.0.0.0/0 for development)
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user's password
6. **Update .env file**:
   ```
   MONGODB_URI=mongodb+srv://ipfi-user:<password>@cluster0.xxxxx.mongodb.net/ipfi-platform?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows (Using MongoDB Community Server)
1. Download: https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```
4. Your connection string will be: `mongodb://localhost:27017/ipfi-platform`

### Windows (Using Docker)
1. Install Docker Desktop
2. Run MongoDB container:
   ```cmd
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
3. Your connection string will be: `mongodb://localhost:27017/ipfi-platform`

## Option 3: Quick Development Database (MongoDB Memory Server)

For testing purposes, you can use an in-memory database:

1. Install mongodb-memory-server:
   ```cmd
   npm install --save-dev mongodb-memory-server
   ```

2. The backend will automatically use in-memory database for development

## After Setting Up MongoDB:

1. **Update your .env file** with the correct MONGODB_URI
2. **Restart the server**:
   ```cmd
   npm run dev
   ```
3. **Seed the database** with sample data:
   ```cmd
   npm run seed
   ```

## Verification

Once connected, you should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net (or localhost)
```

Instead of:
```
⚠️ MongoDB not configured or not running locally
```

## Sample Data

After connecting MongoDB, run the seed command to populate your database with:
- Sample users (admin, creator, investor)
- Sample IP assets (digital art, patents, music)
- Sample investments and transactions

This gives you data to test the API endpoints immediately!