# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the root directory with the following content:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/pos_db?schema=public"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_REFRESH_EXPIRES_IN=30d

   # Bcrypt
   BCRYPT_ROUNDS=10

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Set Up PostgreSQL Database**
   - Create a PostgreSQL database named `pos_db` (or your preferred name)
   - Update the `DATABASE_URL` in `.env` with your database credentials

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run Database Migrations**
   ```bash
   npm run prisma:migrate
   ```
   This will create the database schema.

6. **Seed Database (Optional)**
   ```bash
   npm run prisma:seed
   ```
   This creates default users:
   - Super Admin: `admin@pos.com` / `Admin@123`
   - Admin: `admin@example.com` / `Admin@123`
   - Manager: `manager@example.com` / `Admin@123`
   - Cashier: `cashier@example.com` / `Admin@123`

7. **Start Development Server**
   ```bash
   npm run start:dev
   ```

8. **Access API Documentation**
   - Swagger UI: http://localhost:3000/api/docs

## Testing the API

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos.com",
    "password": "Admin@123"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Users (Admin)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure Explained

```
src/
├── auth/                    # Authentication module
│   ├── guards/              # JWT and Role guards
│   ├── strategies/          # Passport JWT strategy
│   ├── auth.controller.ts   # Auth endpoints (register, login, refresh)
│   ├── auth.service.ts      # Auth business logic
│   └── auth.module.ts       # Auth module definition
│
├── users/                   # User management module
│   ├── dto/                 # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── login.dto.ts
│   │   ├── change-password.dto.ts
│   │   ├── user-response.dto.ts
│   │   └── auth-response.dto.ts
│   ├── users.controller.ts  # User endpoints
│   ├── users.service.ts     # User business logic
│   └── users.module.ts      # User module definition
│
├── prisma/                  # Database service
│   ├── prisma.service.ts    # Prisma client wrapper
│   └── prisma.module.ts     # Prisma module
│
├── config/                  # Configuration
│   ├── config.module.ts     # Config module
│   └── config.service.ts   # Config service
│
├── common/                  # Shared utilities
│   ├── decorators/          # Custom decorators (@CurrentUser, @Roles)
│   ├── dto/                 # Common DTOs (PaginationDto)
│   ├── filters/             # Exception filters
│   └── interceptors/        # Response interceptors
│
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Security Notes

⚠️ **IMPORTANT**: Before deploying to production:

1. Change all default JWT secrets to strong, random strings
2. Update default user passwords
3. Set `NODE_ENV=production`
4. Configure proper CORS origins
5. Use HTTPS
6. Consider adding rate limiting
7. Review and adjust security settings

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Migration Issues
- Run `npm run prisma:generate` first
- Check Prisma schema syntax
- Verify database permissions

### Authentication Issues
- Ensure JWT_SECRET is set in `.env`
- Check token expiration settings
- Verify user status is ACTIVE

