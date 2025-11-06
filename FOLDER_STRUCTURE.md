# Enterprise POS System - Folder Structure

## 📁 Complete Folder Structure

```
src/
├── app.module.ts                    # Root module
├── main.ts                          # Application entry point
│
├── auth/                            # Authentication Module
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── dto/
│   ├── auth.module.ts
│
├── users/                           # User Management Module
│   ├── controllers/
│   │   └── users.controller.ts
│   ├── services/
│   │   └── users.service.ts
│   ├── repositories/
│   │   └── user.repository.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── user-response.dto.ts
│   │   └── ...
│   └── users.module.ts
│
├── groups/                          # Group Management Module
│   ├── controllers/
│   │   └── groups.controller.ts
│   ├── services/
│   │   └── groups.service.ts
│   ├── repositories/
│   │   └── group.repository.ts
│   ├── dto/
│   │   ├── create-group.dto.ts
│   │   ├── update-group.dto.ts
│   │   └── group-response.dto.ts
│   └── groups.module.ts
│
├── permissions/                     # Permission Management Module
│   ├── controllers/
│   │   └── permissions.controller.ts
│   ├── services/
│   │   └── permissions.service.ts
│   ├── repositories/
│   │   └── permission.repository.ts
│   ├── dto/
│   │   ├── create-permission.dto.ts
│   │   └── permission-response.dto.ts
│   └── permissions.module.ts
│
├── stores/                          # Store Management Module
│   ├── controllers/
│   │   └── stores.controller.ts
│   ├── services/
│   │   └── stores.service.ts
│   ├── repositories/
│   │   └── store.repository.ts
│   ├── dto/
│   │   ├── create-store.dto.ts
│   │   └── store-response.dto.ts
│   └── stores.module.ts
│
├── products/                         # Product Management Module
│   ├── controllers/
│   │   └── products.controller.ts
│   ├── services/
│   │   └── products.service.ts
│   ├── repositories/
│   │   └── product.repository.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── product-response.dto.ts
│   └── products.module.ts
│
├── categories/                      # Category Management Module
│   ├── controllers/
│   │   └── categories.controller.ts
│   ├── services/
│   │   └── categories.service.ts
│   ├── repositories/
│   │   └── category.repository.ts
│   ├── dto/
│   │   ├── create-category.dto.ts
│   │   └── category-response.dto.ts
│   └── categories.module.ts
│
├── orders/                          # Order Management Module
│   ├── controllers/
│   │   └── orders.controller.ts
│   ├── services/
│   │   └── orders.service.ts
│   ├── repositories/
│   │   └── order.repository.ts
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   └── order-response.dto.ts
│   └── orders.module.ts
│
├── inventory/                       # Inventory Management Module
│   ├── controllers/
│   │   └── inventory.controller.ts
│   ├── services/
│   │   └── inventory.service.ts
│   ├── repositories/
│   │   └── inventory.repository.ts
│   ├── dto/
│   │   └── inventory-response.dto.ts
│   └── inventory.module.ts
│
├── loyalty/                         # Loyalty & Rewards Module
│   ├── controllers/
│   │   └── customers.controller.ts
│   ├── services/
│   │   └── customers.service.ts
│   ├── repositories/
│   │   └── customer.repository.ts
│   ├── dto/
│   │   ├── create-customer.dto.ts
│   │   └── customer-response.dto.ts
│   └── loyalty.module.ts
│
├── audit/                           # Audit & Logging Module
│   ├── controllers/
│   │   └── audit.controller.ts
│   ├── services/
│   │   └── audit.service.ts
│   ├── repositories/
│   │   └── audit.repository.ts
│   └── audit.module.ts
│
├── sync/                            # Sync & Data Synchronization Module
│   ├── controllers/
│   │   └── sync.controller.ts
│   ├── services/
│   │   └── sync.service.ts
│   ├── repositories/
│   │   └── sync.repository.ts
│   └── sync.module.ts
│
├── common/                          # Shared Common Module
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── dto/
│   │   ├── api-response.dto.ts
│   │   └── pagination.dto.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── services/
│       ├── base.service.ts
│       └── permission.service.ts
│
├── config/                          # Configuration Module
│   ├── config.module.ts
│   └── config.service.ts
│
└── prisma/                          # Prisma Database Module
    ├── prisma.module.ts
    └── prisma.service.ts
```

## 🏗️ Enterprise Folder Structure Pattern

Each feature module follows this structure:

```
{feature}/
├── controllers/          # HTTP controllers (request handling)
│   └── {feature}.controller.ts
├── services/             # Business logic layer
│   └── {feature}.service.ts
├── repositories/         # Data access layer (Repository Pattern)
│   └── {feature}.repository.ts
├── dto/                  # Data Transfer Objects
│   ├── create-{feature}.dto.ts
│   ├── update-{feature}.dto.ts
│   └── {feature}-response.dto.ts
└── {feature}.module.ts   # NestJS module definition
```

## 📋 Module Breakdown

### ✅ Completed Modules:
1. **Groups** - Hierarchical group management
2. **Permissions** - Permission management
3. **Stores** - Multi-store management
4. **Products** - Product/menu management
5. **Categories** - Hierarchical category management
6. **Orders** - Order processing
7. **Inventory** - Stock management
8. **Loyalty** - Customer & loyalty management
9. **Audit** - Audit logging
10. **Sync** - Data synchronization

### 📦 Standard Structure Per Module:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Repositories**: Data access (Repository Pattern)
- **DTOs**: Request/Response validation
- **Module**: NestJS module configuration

## 🎯 Benefits of This Structure

1. **Separation of Concerns**: Clear boundaries between layers
2. **Scalability**: Easy to add new features
3. **Testability**: Each layer can be tested independently
4. **Maintainability**: Organized and easy to navigate
5. **Reusability**: Common utilities in `common/`
6. **Enterprise Standards**: Follows NestJS best practices

---

*Structure created: 2025-11-05*

