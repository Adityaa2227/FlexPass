# PostgreSQL + Prisma Setup Instructions

## Prerequisites
- PostgreSQL installed locally or access to a PostgreSQL database
- Node.js and npm installed

## 1. Database Setup

### Install PostgreSQL (if not already installed)
```bash
# Windows (using chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE flexpass_db;
CREATE USER flexpass_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flexpass_db TO flexpass_user;
\q
```

## 2. Environment Configuration

### Create `.env` file in `/server` directory:
```bash
# Copy example file
cp env.example .env
```

### Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://flexpass_user:your_secure_password@localhost:5432/flexpass_db"
PORT=3001
LOG_LEVEL=info
```

## 3. Install Dependencies & Generate Prisma Client

```bash
cd server
npm install
npm run prisma:generate
```

## 4. Run Database Migrations

```bash
# Create and apply initial migration
npm run prisma:migrate

# This will:
# - Create migration files
# - Apply schema to database
# - Generate Prisma client
```

## 5. Seed Database (Optional)

```bash
# Add default service provider
npm run db:seed
```

## 6. Start Backend with Database

```bash
npm start
```

## 7. Verify Database Connection

### Check Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```
Opens at `http://localhost:5555`

### Test API Endpoints
```bash
# Get service providers
curl http://localhost:3001/api/service-providers

# Health check
curl http://localhost:3001/health
```

## Database Schema Overview

### ServiceProvider
- Stores API service configurations
- Links to wallet addresses for payments
- Tracks pricing and endpoints

### Transaction  
- Logs all blockchain transactions
- Tracks payment status and amounts
- Links to active passes

### ActivePass
- Manages user access permissions
- Supports time-based, usage-based, and unlimited passes
- Automatically expires based on type

## Troubleshooting

### Connection Issues
1. Verify PostgreSQL is running: `pg_ctl status`
2. Check DATABASE_URL format in `.env`
3. Ensure database and user exist

### Migration Issues
1. Reset database: `npm run prisma:migrate reset`
2. Generate client: `npm run prisma:generate`
3. Re-run migrations: `npm run prisma:migrate`

### Permission Issues
```sql
-- Grant additional permissions if needed
GRANT ALL ON SCHEMA public TO flexpass_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO flexpass_user;
```
