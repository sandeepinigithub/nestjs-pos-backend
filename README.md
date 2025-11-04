# POS Backend - NestJS

Enterprise-ready Point of Sale (POS) backend system built with NestJS, PostgreSQL, and Prisma.

## Features

### User Management
- ✅ Complete user CRUD operations
- ✅ Role-based access control (RBAC)
- ✅ User authentication (JWT)
- ✅ Password hashing with bcrypt
- ✅ User status management
- ✅ Email verification support
- ✅ Password reset functionality structure
- ✅ User profile management

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Password strength validation
- ✅ Role-based authorization
- ✅ Secure password storage
- ✅ CORS configuration
- ✅ Input validation with class-validator

### Enterprise Features
- ✅ Scalable architecture
- ✅ Global exception handling
- ✅ Request/response transformation
- ✅ API documentation (Swagger)
- ✅ Environment configuration
- ✅ Database migrations
- ✅ Seeding support
- ✅ Logging

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nestjs-pos-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Seed the database (optional):
```bash
npm run prisma:seed
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/password` - Change password
- `PATCH /api/users/:id/status` - Update user status (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## User Roles

- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `MANAGER` - Management access
- `CASHIER` - Cashier access
- `USER` - Standard user access

## User Status

- `ACTIVE` - User is active
- `INACTIVE` - User is inactive
- `SUSPENDED` - User is suspended
- `PENDING_VERIFICATION` - Awaiting email verification

## Default Users (from seed)

After running the seed script, you can login with:

- **Super Admin**: `admin@pos.com` / `Admin@123`
- **Admin**: `admin@example.com` / `Admin@123`
- **Manager**: `manager@example.com` / `Admin@123`
- **Cashier**: `cashier@example.com` / `Admin@123`

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── guards/        # Auth guards
│   ├── strategies/    # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/             # User management module
│   ├── dto/           # Data Transfer Objects
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── prisma/            # Prisma service
├── config/            # Configuration
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Common DTOs
│   ├── filters/       # Exception filters
│   └── interceptors/  # Response interceptors
├── app.module.ts
└── main.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | `10` |
| `CORS_ORIGIN` | CORS origin | `*` |

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use strong JWT secrets** - Generate random strings for production
3. **Change default passwords** - Update seed data passwords
4. **Enable HTTPS** - Use SSL/TLS in production
5. **Rate limiting** - Consider adding rate limiting for production
6. **Input validation** - All inputs are validated using class-validator

## Scalability Considerations

- **Modular architecture** - Easy to add new features
- **Database indexing** - Prisma schema includes indexes
- **Pagination** - All list endpoints support pagination
- **Service layer** - Business logic separated from controllers
- **Global exception handling** - Consistent error responses
- **Response transformation** - Standardized API responses

## Future Enhancements

- [ ] Email verification service
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Activity logging
- [ ] Audit trails
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Unit and E2E tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

UNLICENSED

## Support

For issues and questions, please open an issue in the repository.
